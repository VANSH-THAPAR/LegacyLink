const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');
const { Student } = require('../models/UnifiedUser'); // Updated to UnifiedUser
const migrationController = require('../controllers/migrationController');

// Debug route - no auth required
router.get('/test', (req, res) => {
    res.json({ msg: 'Student management routes are working!' });
});

// Migration Routes
router.post('/promote/:studentId', authMiddleware, migrationController.promoteStudent);
router.post('/graduate-batch', authMiddleware, migrationController.graduateBatch);

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only Excel files
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel' ||
            file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx, .xls, .csv) are allowed'), false);
        }
    }
});

// Middleware to check if user is university admin
const requireUniversityAdmin = (req, res, next) => {
    if (req.user.role !== 'university') {
        return res.status(403).json({ msg: 'Access denied. University admin role required.' });
    }
    next();
};

// [POST] /api/student-management/upload-preview - Parse Excel and show preview
router.post('/upload-preview', authMiddleware, requireUniversityAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded.' });
        }

        // Parse Excel file
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        if (data.length < 2) {
            return res.status(400).json({ msg: 'Excel file is empty or invalid.' });
        }

        // Extract headers (first row) and data (remaining rows)
        const headers = data[0].map(h => h.toString().toLowerCase().trim());
        const rows = data.slice(1);

        // Validate required columns
        const requiredColumns = ['roll_no', 'name', 'email', 'department', 'year', 'cgpa', 'backlogs'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
            return res.status(400).json({ 
                msg: `Missing required columns: ${missingColumns.join(', ')}. Required columns are: ${requiredColumns.join(', ')}` 
            });
        }

        // Process and validate each row
        const validRows = [];
        const invalidRows = [];
        const duplicateRows = [];

        // Get existing students for duplicate check
        const existingStudents = await Student.find({
            $or: [
                { rollNumber: { $in: rows.map(row => row[headers.indexOf('roll_no')]).filter(Boolean) } },
                { email: { $in: rows.map(row => row[headers.indexOf('email')]).filter(Boolean) } }
            ]
        }).select('rollNumber email');

        const existingRollNumbers = new Set(existingStudents.map(s => s.rollNumber));
        const existingEmails = new Set(existingStudents.map(s => s.email));

        rows.forEach((row, index) => {
            const rowData = {};
            let isValid = true;
            const errors = [];

            // Map columns to data
            headers.forEach((header, headerIndex) => {
                rowData[header] = row[headerIndex];
            });

            // Debug: Log first few rows
            if (index < 5) {
                console.log(`Row ${index + 1}:`, rowData);
            }

            // Validate required fields
            requiredColumns.forEach(col => {
                if (!rowData[col] || rowData[col].toString().trim() === '') {
                    isValid = false;
                    errors.push(`${col} is required`);
                }
            });

            // Validate email format
            if (rowData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.email.toString())) {
                isValid = false;
                errors.push('Invalid email format');
            }

            // Validate CGPA
            if (rowData.cgpa) {
                const cgpa = parseFloat(rowData.cgpa);
                if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
                    isValid = false;
                    errors.push('CGPA must be a number between 0 and 10');
                }
            }

            // Validate backlogs
            if (rowData.backlogs) {
                const backlogs = parseInt(rowData.backlogs);
                if (isNaN(backlogs) || backlogs < 0) {
                    isValid = false;
                    errors.push('Backlogs must be a non-negative integer');
                }
            }

            // Check for duplicates
            const isDuplicateRoll = existingRollNumbers.has(rowData.roll_no?.toString());
            const isDuplicateEmail = existingEmails.has(rowData.email?.toString());

            if (isDuplicateRoll || isDuplicateEmail) {
                duplicateRows.push({
                    rowNumber: index + 2, // Excel row number (1-indexed + header)
                    data: rowData,
                    reason: isDuplicateRoll ? 'Duplicate roll number' : 'Duplicate email'
                });
            } else if (!isValid) {
                invalidRows.push({
                    rowNumber: index + 2,
                    data: rowData,
                    errors
                });
                // Debug: Log invalid row details
                console.log(`Invalid Row ${index + 2}:`, rowData, 'Errors:', errors);
            } else {
                validRows.push({
                    rowNumber: index + 2,
                    data: rowData
                });
            }
        });

        res.json({
            totalRows: rows.length,
            validRows,
            invalidRows,
            duplicateRows,
            headers
        });

    } catch (error) {
        console.error('Excel upload preview error:', error.message);
        res.status(500).json({ msg: 'Error processing Excel file.' });
    }
});

// [POST] /api/student-management/confirm-upload - Save valid students to database
router.post('/confirm-upload', authMiddleware, requireUniversityAdmin, async (req, res) => {
    try {
        const { validRows } = req.body;

        if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
            return res.status(400).json({ msg: 'No valid students to upload.' });
        }

        // Prepare student documents
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('ChangePassword123', salt); // Default password
        
        const studentsToInsert = validRows.map(row => {
            const data = row.data;
            return {
                name: data.name?.toString().trim(),
                email: data.email?.toString().toLowerCase().trim(),
                rollNumber: data.roll_no?.toString().trim(),
                role: 'student',
                course: data.department?.toString().trim(),
                year: data.year?.toString().trim(),
                // Add additional fields for placement eligibility
                cgpa: parseFloat(data.cgpa),
                backlogs: parseInt(data.backlogs) || 0,
                phone: data.phone?.toString().trim() || '',
                collegeName: 'Chitkara University', // Fixed: Default to Chitkara University
                // Set default password
                password: hashedPassword
            };
        });

        // Insert students in bulk
        const result = await Student.insertMany(studentsToInsert, { ordered: false });

        res.json({
            msg: `Successfully uploaded ${result.length} students.`,
            uploadedCount: result.length
        });

    } catch (error) {
        console.error('Confirm upload error:', error.message);
        if (error.code === 11000) {
            // Duplicate key error
            res.status(400).json({ msg: 'Some students already exist in the database.' });
        } else {
            res.status(500).json({ msg: 'Error saving students to database.' });
        }
    }
});

// [POST] /api/student-management/eligibility-check - Check placement eligibility
router.post('/eligibility-check', authMiddleware, requireUniversityAdmin, async (req, res) => {
    try {
        const { criteria } = req.body;

        // Validate criteria
        if (!criteria || typeof criteria !== 'object') {
            return res.status(400).json({ msg: 'Eligibility criteria are required.' });
        }

        const {
            minCGPA = 0,
            maxBacklogs = 10,
            eligibleBranches = [],
            eligibleYears = [],
            eligibleSemesters = []
        } = criteria;

        // Build query
        const query = {
            role: 'student',
            cgpa: { $gte: minCGPA },
            backlogs: { $lte: maxBacklogs }
        };

        if (eligibleBranches.length > 0) {
            query.course = { $in: eligibleBranches };
        }

        if (eligibleYears.length > 0) {
            query.year = { $in: eligibleYears };
        }

        // Find eligible students
        const eligibleStudents = await Student.find(query)
            .select('-password')
            .sort({ cgpa: -1, name: 1 });

        // Get statistics
        const totalStudents = await Student.countDocuments({ role: 'student' });
        const eligibleCount = eligibleStudents.length;
        const eligibilityPercentage = totalStudents > 0 ? (eligibleCount / totalStudents * 100).toFixed(2) : 0;

        res.json({
            criteria,
            summary: {
                totalStudents,
                eligibleCount,
                eligibilityPercentage: parseFloat(eligibilityPercentage)
            },
            eligibleStudents
        });

    } catch (error) {
        console.error('Eligibility check error:', error.message);
        res.status(500).json({ msg: 'Error checking eligibility.' });
    }
});

// [GET] /api/student-management/export-eligible - Export eligible students as Excel
router.get('/export-eligible', authMiddleware, requireUniversityAdmin, async (req, res) => {
    try {
        const { minCGPA, maxBacklogs, eligibleBranches, eligibleYears } = req.query;

        // Build query
        const query = {
            role: 'student',
            cgpa: { $gte: parseFloat(minCGPA) || 0 },
            backlogs: { $lte: parseInt(maxBacklogs) || 10 }
        };

        if (eligibleBranches) {
            const branches = eligibleBranches.split(',');
            if (branches.length > 0) {
                query.course = { $in: branches };
            }
        }

        if (eligibleYears) {
            const years = eligibleYears.split(',');
            if (years.length > 0) {
                query.year = { $in: years };
            }
        }

        // Find eligible students
        const eligibleStudents = await Student.find(query)
            .select('name email rollNumber course year cgpa backlogs phone collegeName')
            .sort({ cgpa: -1, name: 1 });

        // Create Excel workbook
        const workbook = xlsx.utils.book_new();
        const worksheetData = [
            ['Roll Number', 'Name', 'Email', 'Department', 'Year', 'CGPA', 'Backlogs', 'Phone', 'College']
        ];

        eligibleStudents.forEach(student => {
            worksheetData.push([
                student.rollNumber,
                student.name,
                student.email,
                student.course,
                student.year,
                student.cgpa,
                student.backlogs,
                student.phone || '',
                student.collegeName === 'Unknown University' ? 'Chitkara University' : (student.collegeName || 'Chitkara University')
            ]);
        });

        const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Eligible Students');

        // Generate buffer
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=eligible-students.xlsx');
        res.send(buffer);

    } catch (error) {
        console.error('Export eligible error:', error.message);
        res.status(500).json({ msg: 'Error exporting eligible students.' });
    }
});

// [GET] /api/student-management/stats - Get student management statistics
router.get('/stats', authMiddleware, requireUniversityAdmin, async (req, res) => {
    try {
        const stats = await Student.aggregate([
            { $match: { role: 'student' } },
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    averageCGPA: { $avg: '$cgpa' },
                    totalBacklogs: { $sum: '$backlogs' },
                    departments: { $addToSet: '$course' },
                    years: { $addToSet: '$year' }
                }
            }
        ]);

        const departmentStats = await Student.aggregate([
            { $match: { role: 'student' } },
            {
                $group: {
                    _id: '$course',
                    count: { $sum: 1 },
                    averageCGPA: { $avg: '$cgpa' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            overview: stats[0] || {
                totalStudents: 0,
                averageCGPA: 0,
                totalBacklogs: 0,
                departments: [],
                years: []
            },
            departmentStats
        });

    } catch (error) {
        console.error('Stats error:', error.message);
        res.status(500).json({ msg: 'Error fetching statistics.' });
    }
});

module.exports = router;
