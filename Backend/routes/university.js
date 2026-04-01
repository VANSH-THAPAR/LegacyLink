const express = require('express');
const router = express.Router();
const Alumni = require('../models/alumni');
const Student = require('../models/student');
const VerificationRequest = require('../models/VerificationRequest');

// Get university dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get total counts
        const totalAlumni = await Alumni.countDocuments();
        const totalStudents = await Student.countDocuments();

        // Get alumni growth data by batch year
        const alumniByYear = await Alumni.aggregate([
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
            createdAt: { $gte: sixMonthsAgo }
        });

        // Get current students by year
        const studentsByYear = await Student.aggregate([
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
router.get('/requests', async (req, res) => {
    try {
        const requests = await VerificationRequest.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Error fetching requests' });
    }
});

// Approve/reject request
router.put('/requests/:id', async (req, res) => {
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
