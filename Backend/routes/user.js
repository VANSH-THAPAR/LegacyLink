const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { Student, Alumni, University } = require('../models/User');

// [GET] /api/user/me - Get logged in user's full data
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // req.user is attached by the authMiddleware and contains the user ID and role
        let user;
        
        // Search in the appropriate collection based on role
        if (req.user.role === 'student') {
            user = await Student.findById(req.user.id).select('-password');
        } else if (req.user.role === 'alumni') {
            user = await Alumni.findById(req.user.id).select('-password');
        } else if (req.user.role === 'university') {
            user = await University.findById(req.user.id).select('-password');
        }
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user); // Send the full user object
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// [PUT] /api/user/profile - Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        // Find user in appropriate collection based on role
        let user;
        if (req.user.role === 'student') {
            user = await Student.findById(req.user.id);
        } else if (req.user.role === 'alumni') {
            user = await Alumni.findById(req.user.id);
        } else if (req.user.role === 'university') {
            user = await University.findById(req.user.id);
        }
        
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const { 
            name, email, course, year, interests, collegeName, graduatingYear, universityName,
            position, company, industry, skills, bio, linkedin, location, profilePicture,
            isMentor, mentorshipAreas, maxMentees
        } = req.body;

        // Handle Cloudinary upload for profile picture
        if (profilePicture && profilePicture.startsWith('data:image')) {
            const cloudinary = require('../utils/cloudinary');
            try {
                const uploadedResponse = await cloudinary.uploader.upload(profilePicture, {
                    folder: "legacylink_profiles",
                    resource_type: "image"
                });
                user.profilePicture = uploadedResponse.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
            }
        } else if (profilePicture !== undefined) {
            user.profilePicture = profilePicture;
        }

        // Update common fields
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (interests !== undefined) user.interests = interests;

        // Update student-specific fields
        if (course !== undefined) user.course = course;
        if (year !== undefined) user.year = year;
        if (collegeName !== undefined) user.collegeName = collegeName;
        if (graduatingYear !== undefined) user.graduatingYear = graduatingYear;
        if (universityName !== undefined) user.universityName = universityName;

        // Update alumni-specific fields
        if (position !== undefined) user.position = position;
        if (company !== undefined) user.company = company;
        if (industry !== undefined) user.industry = industry;
        if (skills !== undefined) user.skills = skills;
        if (bio !== undefined) user.bio = bio;
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (location !== undefined) user.location = location;

        // Update mentorship fields
        if (isMentor !== undefined) user.isMentor = isMentor;
        if (mentorshipAreas !== undefined) user.mentorshipAreas = mentorshipAreas;
        if (maxMentees !== undefined) user.maxMentees = maxMentees;

        await user.save();
        
        // Return the full, updated user object (without the password)
        let updatedUser;
        if (req.user.role === 'student') {
            updatedUser = await Student.findById(req.user.id).select('-password');
        } else if (req.user.role === 'alumni') {
            updatedUser = await Alumni.findById(req.user.id).select('-password');
        } else if (req.user.role === 'university') {
            updatedUser = await University.findById(req.user.id).select('-password');
        }
        
        console.log('Sending updated user data:', updatedUser);
        res.json(updatedUser);

    } catch (err) {
        console.error("Profile Update Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;