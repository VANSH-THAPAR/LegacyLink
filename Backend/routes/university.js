const express = require('express');
const router = express.Router();
const Alumni = require('../models/alumniSchema');
const Student = require('../models/studentSchema');

// Get university dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get total counts
        const totalAlumni = await Alumni.countDocuments();
        const totalStudents = await Student.countDocuments();

        // Get alumni growth data by batch year (with hardcoded data for demo)
        let alumniByYear = await Alumni.aggregate([
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

        // If no real data, use hardcoded demo data
        if (alumniByYear.length === 0) {
            alumniByYear = [
                { _id: 2018, count: 45 },
                { _id: 2019, count: 52 },
                { _id: 2020, count: 38 },
                { _id: 2021, count: 61 },
                { _id: 2022, count: 73 },
                { _id: 2023, count: 89 },
                { _id: 2024, count: 94 }
            ];
        }

        // Get recent alumni (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const recentAlumni = await Alumni.countDocuments({
            createdAt: { $gte: sixMonthsAgo }
        });

        // Get current students by year (with hardcoded data for demo)
        let studentsByYear = await Student.aggregate([
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

        // If no real data, use hardcoded demo data
        if (studentsByYear.length === 0) {
            studentsByYear = [
                { _id: 2021, count: 85 },
                { _id: 2022, count: 92 },
                { _id: 2023, count: 78 },
                { _id: 2024, count: 88 },
                { _id: 2025, count: 95 }
            ];
        }

        // Get degree program distribution (with hardcoded data for demo)
        let alumniByProgram = await Alumni.aggregate([
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

        // If no real data, use hardcoded demo data
        if (alumniByProgram.length === 0) {
            alumniByProgram = [
                { _id: 'Computer Science', count: 145 },
                { _id: 'Business Administration', count: 98 },
                { _id: 'Electrical Engineering', count: 76 },
                { _id: 'Mechanical Engineering', count: 62 },
                { _id: 'Information Technology', count: 54 }
            ];
        }

        res.json({
            totalAlumni,
            totalStudents,
            recentAlumni: recentAlumni || 12, // Default demo value
            alumniByYear,
            studentsByYear,
            alumniByProgram,
            monthlyGrowth: recentAlumni || 12
        });
    } catch (error) {
        console.error('Error fetching university stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// Get pending requests (alumni verifications, transcript requests, etc.)
router.get('/requests', async (req, res) => {
    try {
        // Return hardcoded demo requests for now
        const mockRequests = [
            {
                _id: '1',
                name: 'John Doe',
                type: 'Alumni Verification',
                email: 'john.doe@example.com',
                status: 'pending',
                createdAt: new Date('2024-01-15'),
                avatar: 'https://i.pravatar.cc/150?u=john'
            },
            {
                _id: '2',
                name: 'Jane Smith',
                type: 'Transcript Request',
                email: 'jane.smith@example.com',
                status: 'pending',
                createdAt: new Date('2024-01-14'),
                avatar: 'https://i.pravatar.cc/150?u=jane'
            },
            {
                _id: '3',
                name: 'Sam Wilson',
                type: 'Event Registration',
                email: 'sam.wilson@example.com',
                status: 'pending',
                createdAt: new Date('2024-01-13'),
                avatar: 'https://i.pravatar.cc/150?u=sam'
            },
            {
                _id: '4',
                name: 'Emily Davis',
                type: 'Alumni Verification',
                email: 'emily.davis@example.com',
                status: 'pending',
                createdAt: new Date('2024-01-12'),
                avatar: 'https://i.pravatar.cc/150?u=emily'
            },
            {
                _id: '5',
                name: 'Michael Chen',
                type: 'Donation Inquiry',
                email: 'michael.chen@example.com',
                status: 'pending',
                createdAt: new Date('2024-01-11'),
                avatar: 'https://i.pravatar.cc/150?u=michael'
            }
        ];

        res.json(mockRequests);
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

        // In a real implementation, this would update the request in the database
        // For now, we'll just return success
        res.json({ message: `Request ${requestId} ${status} successfully` });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'Error updating request' });
    }
});

module.exports = router;
