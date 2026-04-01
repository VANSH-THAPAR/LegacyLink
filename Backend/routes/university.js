const express = require('express');
const router = express.Router();
const Alumni = require('../models/alumni');
const Student = require('../models/student');
const VerificationRequest = require('../models/VerificationRequest');
const University = require('../models/University');
const auth = require('../middleware/authMiddleware');

// Get university dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        // Authenticate the university and get its universityName
        const universityUser = await University.findOne({ authId: req.user.id });
        if (!universityUser) {
            return res.status(404).json({ message: 'University details not found' });
        }
        
        const collegeName = universityUser.universityName;

        // Get total counts filtered by collegeName
        const totalAlumni = await Alumni.countDocuments({ collegeName });
        const totalStudents = await Student.countDocuments({ collegeName });

        // Get alumni growth data by batch year
        const alumniByYear = await Alumni.aggregate([
            { $match: { collegeName } },
            {
                $group: {
                    _id: '$batchYear',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get recent alumni (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const recentAlumni = await Alumni.countDocuments({
            collegeName,
            createdAt: { $gte: sixMonthsAgo }
        });

        // Get current students by year
        const studentsByYear = await Student.aggregate([
            { $match: { collegeName } },
            {
                $group: {
                    _id: '$batchYear',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get degree program distribution
        const alumniByProgram = await Alumni.aggregate([
            { $match: { collegeName } },
            {
                $group: {
                    _id: '$degreeProgram',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        res.json({
            totalAlumni,
            totalStudents,
            recentAlumni,
            alumniByYear,
            studentsByYear,
            alumniByProgram,
            monthlyGrowth: recentAlumni
        });
    } catch (error) {
        console.error('Error fetching university stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// Get pending requests (alumni verifications, transcript requests, etc.)
router.get('/requests', auth, async (req, res) => {
    try {
        const universityUser = await University.findOne({ authId: req.user.id });
        if (!universityUser) {
            return res.status(404).json({ message: 'University details not found' });
        }
        
        const collegeName = universityUser.universityName;

        // Optionally, if VerificationRequest can be filtered by college name, we do it here.
        // Assuming students and alumni need to be looked up or if it has a collegeName field.
        // If not, at least we just return requests where we find matching collegeName in user models.
        // For now, if no collegeName on VerificationRequest, we might need a workaround or just return all (if global admin)
        // Let's filter by finding alumni/students with that college, and matching their VerificationRequests
        const students = await Student.find({ collegeName }).select('_id');
        const alumni = await Alumni.find({ collegeName }).select('_id');
        const userIds = [...students.map(s => s._id), ...alumni.map(a => a._id)];

        const requests = await VerificationRequest.find({ 
            status: 'pending',
            userId: { $in: userIds }
        })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Error fetching requests' });
    }
});

// Approve/reject request
router.put('/requests/:id', auth, async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const requestId = req.params.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await VerificationRequest.findByIdAndUpdate(
            requestId, 
            { status }, 
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Logic to update the actual user entity if approved
        if (status === 'approved') {
            // Note: Actual update depends on logic (e.g., set isVerified = true on User)
             if (request.userModel === 'Alumni') {
                 // await Alumni.findByIdAndUpdate(request.userId, { isVerified: true });
            } else if (request.userModel === 'Student') {
                 // await Student.findByIdAndUpdate(request.userId, { isVerified: true });
            }
        }

        res.json({ message: `Request ${requestId} ${status} successfully`, request });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'Error updating request' });
    }
});

module.exports = router;
