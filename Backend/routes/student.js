const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { Student } = require('../models/User');

// [GET] /api/student/search - Search students by name, course, interests, etc.
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { q, course, year, limit = 20 } = req.query;
        
        let query = {}; // Only searching Student collection
        
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { course: { $regex: q, $options: 'i' } },
                { collegeName: { $regex: q, $options: 'i' } },
                { interests: { $in: [new RegExp(q, 'i')] } }
            ];
        }
        
        if (course) {
            query.course = course;
        }
        
        if (year) {
            query.year = year;
        }
        
        const students = await Student.find(query)
            .select('-password')
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
            
        res.json(students);
    } catch (err) {
        console.error('Student search error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [GET] /api/student/profile/:id - Get specific student profile
router.get('/profile/:id', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-password');
        
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        
        res.json(student);
    } catch (err) {
        console.error('Get student profile error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [GET] /api/student/by-interests - Get students by interests
router.get('/by-interests', authMiddleware, async (req, res) => {
    try {
        const { interests } = req.query;
        
        if (!interests) {
            return res.status(400).json({ msg: 'Interests parameter is required' });
        }
        
        const interestArray = interests.split(',');
        const students = await Student.find({ 
            interests: { $in: interestArray }
        })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(20);
        
        res.json(students);
    } catch (err) {
        console.error('Get students by interests error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
