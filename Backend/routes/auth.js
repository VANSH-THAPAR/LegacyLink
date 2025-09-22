const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Student, Alumni, University } = require('../models/User');
const cloudinary = require('../utils/cloudinary'); // Use the new config file

// [POST] /api/auth/signup - Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { role, password, profilePicture } = req.body;

        if (!role || !password) {
            return res.status(400).json({ msg: 'Role and password are required.' });
        }
        
        let imageUrl = '';
        // If a profile picture is included in the form data...
        if (profilePicture) {
            try {
                // ...upload it directly to Cloudinary.
                const uploadedResponse = await cloudinary.uploader.upload(profilePicture, {
                    folder: "legacylink_profiles", // This creates a folder in Cloudinary to keep images organized
                    resource_type: "image",
                });
                imageUrl = uploadedResponse.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return res.status(500).json({ msg: 'Image could not be uploaded.' });
            }
        }
        
        let newUser;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (role === 'university') {
            const { universityId, universityName } = req.body;
            if (!universityId || !universityName) return res.status(400).json({ msg: 'University name and ID are required.' });
            if (await University.findOne({ universityId })) return res.status(400).json({ msg: 'A university with this ID already exists.' });
            
            newUser = new University({ ...req.body, password: hashedPassword });
        } else if (role === 'student') {
            const { email, name, rollNumber } = req.body;
            if (!email || !name || !rollNumber) return res.status(400).json({ msg: 'Email, name, and roll number are required.' });
            if (await Student.findOne({ email })) return res.status(400).json({ msg: 'A user with this email already exists.' });
            if (await Student.findOne({ rollNumber })) return res.status(400).json({ msg: 'A user with this roll number already exists.' });
            
            newUser = new Student({ ...req.body, password: hashedPassword, profilePicture: imageUrl });
        } else if (role === 'alumni') {
            const { email, name, rollNumber } = req.body;
            if (!email || !name || !rollNumber) return res.status(400).json({ msg: 'Email, name, and roll number are required.' });
            if (await Alumni.findOne({ email })) return res.status(400).json({ msg: 'A user with this email already exists.' });
            if (await Alumni.findOne({ rollNumber })) return res.status(400).json({ msg: 'A user with this roll number already exists.' });
            
            newUser = new Alumni({ ...req.body, password: hashedPassword, profilePicture: imageUrl });
        } else {
            return res.status(400).json({ msg: 'Invalid role specified.' });
        }

        console.log('Creating user with role:', role); // Debug log
        await newUser.save();
        console.log('User saved with role:', newUser.role, 'in collection:', newUser.constructor.modelName); // Debug log

        res.status(201).json({ msg: 'User registered successfully!' });

    } catch (err) {
        console.error("Signup Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// [POST] /api/auth/login - (No changes needed here, included for completeness)
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) return res.status(400).json({ msg: 'Please provide an identifier and password.' });

        // Search across all collections for the user
        let user = await Student.findOne({
            $or: [{ email: identifier }, { rollNumber: identifier }]
        }).select('+password');
        
        if (!user) {
            user = await Alumni.findOne({
                $or: [{ email: identifier }, { rollNumber: identifier }]
            }).select('+password');
        }
        
        if (!user) {
            user = await University.findOne({
                universityId: identifier
            }).select('+password');
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        const payload = { user: { id: user.id, role: user.role } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                // Exclude password from the returned user object
                const userToReturn = user.toObject();
                delete userToReturn.password;
                res.json({ token, user: userToReturn });
            }
        );
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;