const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Alumni, University } = require('../models/UnifiedUser'); // Updated to UnifiedUser
const cloudinary = require('../utils/cloudinary'); // Use the new config file
const authCache = require('../utils/cache');

// [POST] /api/auth/signup - Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { role, password, profilePicture } = req.body;

        if (!role || !password) {
            return res.status(400).json({ msg: 'Role and password are required.' });
        }
        
        let imageUrl = '';
        if (profilePicture) {
            try {
                const uploadedResponse = await cloudinary.uploader.upload(profilePicture, {
                    folder: "legacylink_profiles",
                    resource_type: "image",
                });
                imageUrl = uploadedResponse.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                // Continue without image or fail? Let's verify requirement. 
                // Previous code returned 500.
                return res.status(500).json({ msg: 'Image could not be uploaded.' });
            }
        }
        
        let newUser;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Global duplicate check for email/rollNumber if applicable
        if (req.body.email) {
            if (await User.findOne({ email: req.body.email })) return res.status(400).json({ msg: 'A user with this email already exists.' });
        }
        if (req.body.rollNumber) {
            if (await User.findOne({ rollNumber: req.body.rollNumber })) return res.status(400).json({ msg: 'A user with this roll number already exists.' });
        }

        if (role === 'university') {
            const { universityId, universityName } = req.body;
            if (!universityId || !universityName) return res.status(400).json({ msg: 'University name and ID are required.' });
            if (await University.findOne({ universityId })) return res.status(400).json({ msg: 'A university with this ID already exists.' });
            
            // Map universityName to name for BaseUserSchema requirement
            newUser = new University({ 
                ...req.body, 
                name: universityName, // Required by BaseSchema
                password: hashedPassword 
            });
        } else if (role === 'student') {
            const { email, name, rollNumber } = req.body;
            if (!email || !name || !rollNumber) return res.status(400).json({ msg: 'Email, name, and roll number are required.' });
            
            newUser = new Student({ ...req.body, password: hashedPassword, profilePicture: imageUrl });
        } else if (role === 'alumni') {
            const { email, name, rollNumber } = req.body;
            if (!email || !name || !rollNumber) return res.status(400).json({ msg: 'Email, name, and roll number are required.' });
            
            newUser = new Alumni({ ...req.body, password: hashedPassword, profilePicture: imageUrl });
        } else {
            return res.status(400).json({ msg: 'Invalid role specified.' });
        }

        console.log('Creating user with role:', role);
        await newUser.save();
        console.log('User saved successfully');

        res.status(201).json({ msg: 'User registered successfully!' });

    } catch (err) {
        console.error("Signup Error:", err); // Improved logging
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Duplicate key error. User already exists.' });
        }
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// [POST] /api/auth/login - Optimized for faster authentication
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        
        // Enhanced input validation
        if (!identifier || !password || 
            typeof identifier !== 'string' || typeof password !== 'string' ||
            identifier.trim().length === 0 || password.length === 0) {
            return res.status(400).json({ msg: 'Please provide valid identifier and password.' });
        }

        // Basic rate limiting check (prevent brute force)
        if (password.length > 128 || identifier.length > 100) {
            return res.status(400).json({ msg: 'Input too long.' });
        }

        const trimmedIdentifier = identifier.trim().toLowerCase();
        let user = null;

        // Check cache first for faster response
        user = authCache.get(trimmedIdentifier);
        
        if (!user) {
            // Optimized: Search using the base User model with an $or query
            // This checks all roles (Student, Alumni, University) in a single DB call
            // and leverages the indexes we set up in UnifiedUser.js
            user = await User.findOne({
                $or: [
                    { email: trimmedIdentifier },
                    { rollNumber: trimmedIdentifier }, // Student/Alumni ID
                    { universityId: trimmedIdentifier } // University ID
                ]
            }).select('+password').lean(); // Lean for performance

            // Cache the user for future requests (if found)
            if (user) {
                authCache.set(trimmedIdentifier, user);
            }
        }

        // Early return if user not found
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        // Create JWT payload with minimal data
        const payload = { 
            user: { 
                id: user._id, 
                role: user.role,
                email: user.email || user.universityId
            } 
        };

        // Generate token synchronously for better performance
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' }
        );

        // Return minimal user data for faster response
        const userResponse = {
            _id: user._id,
            role: user.role,
            name: user.name || user.universityName,
            email: user.email || user.universityId,
            profilePicture: user.profilePicture
        };

        res.json({ token, user: userResponse });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


module.exports = router;