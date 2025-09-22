const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { Alumni } = require('../models/User');

// [GET] /api/alumni/search - Search alumni by name, skills, company, etc.
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { q, industry, graduationYear, limit = 20 } = req.query;
        
        let query = {}; // Remove role filter since we're only searching Alumni collection
        
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { position: { $regex: q, $options: 'i' } },
                { company: { $regex: q, $options: 'i' } },
                { skills: { $in: [new RegExp(q, 'i')] } }
            ];
        }
        
        if (industry) {
            query.industry = industry;
        }
        
        if (graduationYear) {
            query.graduatingYear = parseInt(graduationYear);
        }
        
        const alumni = await Alumni.find(query)
            .select('-password')
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
            
        res.json(alumni);
    } catch (err) {
        console.error('Alumni search error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [GET] /api/alumni/profile/:id - Get specific alumni profile
router.get('/profile/:id', authMiddleware, async (req, res) => {
    try {
        const alumni = await Alumni.findById(req.params.id).select('-password');
        
        if (!alumni) {
            return res.status(404).json({ msg: 'Alumni not found' });
        }
        
        res.json(alumni);
    } catch (err) {
        console.error('Get alumni profile error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [GET] /api/alumni/top-contributors - Get top contributing alumni
router.get('/top-contributors', authMiddleware, async (req, res) => {
    try {
        const topAlumni = await Alumni.find({ 
            isTopContributor: true 
        })
        .select('-password')
        .sort({ engagementScore: -1 })
        .limit(10);
        
        res.json(topAlumni);
    } catch (err) {
        console.error('Get top contributors error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [POST] /api/alumni/mentorship-request - Send mentorship request
router.post('/mentorship-request', authMiddleware, async (req, res) => {
    try {
        const { mentorId, message } = req.body;
        
        if (!mentorId || !message) {
            return res.status(400).json({ msg: 'Mentor ID and message are required' });
        }
        
        const mentor = await Alumni.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ msg: 'Mentor not found' });
        }
        
        // In a real app, you'd save this to a MentorshipRequest model
        // For now, we'll just return success
        res.json({ 
            msg: 'Mentorship request sent successfully',
            mentorName: mentor.name 
        });
    } catch (err) {
        console.error('Mentorship request error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
