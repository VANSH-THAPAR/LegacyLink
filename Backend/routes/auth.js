const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthUser = require('../models/AuthUser');
const Student = require('../models/student');
const Alumni = require('../models/alumni');
const University = require('../models/University');
const Admin = require('../models/Admin');
const AuthController = require('../controllers/authController');
const cloudinary = require('../utils/cloudinary');

// [POST] /api/auth/signup - Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { role, password, profilePicture } = req.body;

        if (!role || !password) {
            return res.status(400).json({ msg: 'Role and password are required.' });
        }
        
        // Validate required fields based on role
        if (role === 'student' || role === 'alumni') {
            const { email, name, rollNumber } = req.body;
            if (!email || !name || !rollNumber) {
                return res.status(400).json({ msg: 'Email, name, and roll number are required.' });
            }
        } else if (role === 'university') {
            const { universityId, universityName } = req.body;
            if (!universityId || !universityName) {
                return res.status(400).json({ msg: 'University name and ID are required.' });
            }
        }
        
        // Check if email already exists in AuthUser
        if (req.body.email) {
            const existingAuthUser = await AuthUser.findOne({ email: req.body.email });
            if (existingAuthUser) {
                return res.status(400).json({ msg: 'A user with this email already exists.' });
            }
        }
        
        // Check if roll number already exists in AuthUser
        if (req.body.rollNumber) {
            const existingRollUser = await AuthUser.findOne({ rollNumber: req.body.rollNumber });
            if (existingRollUser) {
                return res.status(400).json({ msg: 'A user with this roll number already exists.' });
            }
        }
        
        // Check if university ID already exists
        if (req.body.universityId) {
            const existingUniversity = await AuthUser.findOne({ email: req.body.universityId });
            if (existingUniversity) {
                return res.status(400).json({ msg: 'A university with this ID already exists.' });
            }
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
                return res.status(500).json({ msg: 'Image could not be uploaded.' });
            }
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create AuthUser first
        const authUserData = {
            email: req.body.email || req.body.universityId,
            rollNumber: req.body.rollNumber || req.body.universityId,
            password: hashedPassword,
            role: role
        };

        const authUser = new AuthUser(authUserData);
        await authUser.save();

        // Create role-specific profile with authId reference
        const profileData = { ...req.body };
        delete profileData.password; // Remove password from profile data
        
        const profile = await AuthController.createProfile(profileData, role, authUser._id, imageUrl);

        console.log(`Created ${role} user successfully`);
        res.status(201).json({ msg: 'User registered successfully!' });

    } catch (err) {
        console.error("Signup Error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Duplicate key error. User already exists.' });
        }
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// [POST] /api/auth/login - Login user with email or roll number
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ msg: 'Identifier and password are required.' });
        }

        // Enhanced input validation
        if (typeof identifier !== 'string' || typeof password !== 'string' ||
            identifier.trim().length === 0 || password.length === 0) {
            return res.status(400).json({ msg: 'Please provide valid identifier and password.' });
        }

        // Basic rate limiting check
        if (password.length > 128 || identifier.length > 100) {
            return res.status(400).json({ msg: 'Input too long.' });
        }

        const trimmedIdentifier = identifier.trim();

        // Find user using $or condition to support email or roll number login
        const user = await AuthUser.findOne({
            $or: [
                { email: trimmedIdentifier.toLowerCase() },
                { rollNumber: trimmedIdentifier }
            ]
        }).select('+password');
        
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        if (!user.isActive) {
            return res.status(400).json({ msg: 'Account is deactivated.' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        // Update last login
        await AuthController.updateLastLogin(user._id);

        // Get complete user data including profile
        const completeUserData = await AuthController.getCompleteUserData(user);

        // Create JWT token
        const payload = { 
            user: { 
                id: user._id, 
                role: user.role,
                email: user.email
            } 
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' }
        );

        // Determine redirect path based on role
        let redirectTo = '/dashboard';
        if (user.role === 'student') redirectTo = '/student';
        else if (user.role === 'alumni') redirectTo = '/alumni';
        else if (user.role === 'university' || user.role === 'admin') redirectTo = '/university-dashboard';

        res.json({ 
            token, 
            user: completeUserData,
            redirectTo
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// [POST] /api/auth/verify-token - Verify JWT token
router.post('/verify-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ msg: 'Token is required.' });
        }

        const userData = await AuthController.verifyToken(token);
        
        if (!userData) {
            return res.status(401).json({ msg: 'Invalid or expired token.' });
        }

        res.json({ user: userData });

    } catch (err) {
        console.error("Token Verification Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// [PUT] /api/auth/update-profile - Update user profile
router.put('/update-profile', async (req, res) => {
    try {
        const { token, ...updateData } = req.body;

        if (!token) {
            return res.status(400).json({ msg: 'Token is required.' });
        }

        const userData = await AuthController.verifyToken(token);
        
        if (!userData) {
            return res.status(401).json({ msg: 'Invalid or expired token.' });
        }

        const updatedProfile = await AuthController.updateProfile(
            userData._id,
            userData.role,
            updateData
        );

        res.json({ 
            msg: 'Profile updated successfully',
            profile: updatedProfile
        });

    } catch (err) {
        console.error("Profile Update Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// [DELETE] /api/auth/delete-account - Delete user account
router.delete('/delete-account', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ msg: 'Token is required.' });
        }

        const userData = await AuthController.verifyToken(token);
        
        if (!userData) {
            return res.status(401).json({ msg: 'Invalid or expired token.' });
        }

        await AuthController.deleteAccount(userData._id);

        res.json({ msg: 'Account deleted successfully' });

    } catch (err) {
        console.error("Account Deletion Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;