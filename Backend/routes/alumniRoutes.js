const express = require('express');
const router = express.Router();
const Alumni = require('../models/alumni');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const xlsx = require('xlsx');
const cloudinary = require('cloudinary').v2;

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Helper function for Excel key mapping (CASE-INSENSITIVE) ---
const mapExcelKeysToSchema = (record) => {
    const schemaKeyMap = {
        studentid: 'rollNumber', 
        rollnumber: 'rollNumber',
        student_id: 'rollNumber',
        'roll number': 'rollNumber',
        linkedinurl: 'linkedin',
        linkedin_url: 'linkedin',
        profilepicture: 'profilePicture',
        profile_picture: 'profilePicture',
        companyname: 'company', 
        company_name: 'company',
        company: 'company',
        organization: 'company',
        'organization / self employed - business / university': 'company',
        name: 'name',
        universityemail: 'email', 
        university_email: 'email',
        email: 'email',
        'email address (official)': 'email',
        personalemail: 'personalEmail', 
        personal_email: 'personalEmail',
        'email address (personal)': 'personalEmail',
        contactnumber: 'contactNumber',
        contact_number: 'contactNumber',
        'mobile number': 'contactNumber',
        'mobile number (with country code)': 'contactNumber',
        whatsappnumber: 'phone',
        'whatsapp number': 'phone',
        'whatsapp number (with country code)': 'phone',
        phone: 'phone',
        fathername: 'fatherName',
        father_name: 'fatherName',
        mothername: 'motherName',
        mother_name: 'motherName',
        nationality: 'nationality',
        gender: 'gender',
        role: 'role',
        dob: 'dob',
        dateofbirth: 'dob',
        'date of birth': 'dob',
        profession: 'profession',
        'current status': 'profession',
        batchyear: 'batchYear',
        batch_year: 'batchYear',
        degreeprogram: 'degreeProgram',
        degree_program: 'degreeProgram',
        course: 'degreeProgram',
        location: 'location',
        campus: 'location',
        position: 'position',
        designation: 'position',
        'designation / course (studies)': 'position'
    };
    
    // Standardizer for degree programs
    const standardizeDegree = (degree) => {
        if (!degree) return degree;
        const lower = degree.toLowerCase().trim();
        if (lower.includes('cse') || lower.includes('computer science')) return 'B.E. Computer Science Engineering';
        if (lower.includes('ece') || lower.includes('electronics')) return 'B.E. Electronics & Communication';
        if (lower.includes('mech') || lower.includes('mechanical')) return 'B.E. Mechanical Engineering';
        if (lower.includes('civil')) return 'B.E. Civil Engineering';
        if (lower.includes('bca') || lower.includes('bachelor of computer application')) return 'BCA';
        if (lower.includes('mca') || lower.includes('master of computer application')) return 'MCA';
        if (lower.includes('mba') || lower.includes('master of business')) return 'MBA';
        if (lower.includes('bba') || lower.includes('bachelor of business')) return 'BBA';
        return degree.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    const newRecord = {};
    for (const key in record) {
        const lowerCaseKey = key.toLowerCase().trim().replace(/\s+/g, ' '); // Keep spaces for exact matches of verbose headers
        const strippedKey = lowerCaseKey.replace(/\s+/g, ''); // Stripped version for old keys

        const newKey = schemaKeyMap[lowerCaseKey] || schemaKeyMap[strippedKey];
        if (newKey) {
            newRecord[newKey] = record[key];
        }
    }
    
    // Standardize specific fields
    if (newRecord.degreeProgram) {
        newRecord.degreeProgram = standardizeDegree(newRecord.degreeProgram);
    }
    
    // Default values if missing
    if (!newRecord.role) {
        newRecord.role = 'alumni';
    } else {
        newRecord.role = newRecord.role.toLowerCase(); // Ensure lowercase for enum validation
    }
    if (!newRecord.collegeName) newRecord.collegeName = 'Chitkara University';
    if (!newRecord.password) newRecord.password = '$2a$10$fbO6T7yB0.dDq.y/Wp/oO.j7l7W/y/Wp/oO.j7l7W'; 
    
    return newRecord;
};

// --- GET: Fetch alumni (GET /api/alumni/get-alumni) ---
router.get('/get-alumni', authMiddleware, async (req, res) => {
    try {
        const query = {};
        
        // Ensure we load alumni only from the logged-in university's collegeName
        const University = require('../models/University');
        const userDetails = await University.findOne({ authId: req.user.id });
        if (userDetails && userDetails.universityName) {
            query.collegeName = userDetails.universityName;
        }
        
        // Map frontend filters to schema fields
        if (req.query.name) query.name = { $regex: new RegExp(req.query.name, 'i') };
        if (req.query.StudentId) query.rollNumber = { $regex: new RegExp(req.query.StudentId, 'i') }; // Partial match for ID
        if (req.query.batchYear) query.batchYear = parseInt(req.query.batchYear);
        if (req.query.degreeProgram) query.degreeProgram = req.query.degreeProgram;
        if (req.query.gender) query.gender = req.query.gender;
        if (req.query.profession) query.profession = { $regex: new RegExp(req.query.profession, 'i') };
        if (req.query.nationality) query.nationality = { $regex: new RegExp(req.query.nationality, 'i') };

        console.log('GET /api/alumni/get-alumni - Query:', query);
        // Explicitly check role to ensure we get alumni, though discriminator handles it usually
        const findAlumni = await Alumni.find(query);
        console.log(`Found ${findAlumni.length} alumni records.`);
        
        res.status(200).json(findAlumni);
    } catch (err) {
        console.error("ERROR fetching alumni:", err); 
        res.status(500).json({ message: "Unable to get alumni", error: err.message });
    }
});

// --- GET: Metadata for filters (GET /api/alumni/metadata) ---
router.get('/metadata', authMiddleware, async (req, res) => {
    try {
        const University = require('../models/University');
        const userDetails = await University.findOne({ authId: req.user.id });
        const matchQuery = userDetails && userDetails.universityName ? { collegeName: userDetails.universityName } : {};
        
        console.log('GET /api/alumni/metadata - HIT!');
        
        const [batchYears, degreePrograms, genders, professions] = await Promise.all([
            Alumni.distinct('batchYear', matchQuery),
            Alumni.distinct('degreeProgram', matchQuery),
            Alumni.distinct('gender', matchQuery),
            Alumni.distinct('profession', matchQuery)
        ]);
        res.status(200).json({
            batchYears: batchYears.filter(Boolean).sort((a, b) => b - a),
            degreePrograms: degreePrograms.filter(Boolean).sort(),
            genders: genders.filter(Boolean).sort(),
            professions: professions.filter(Boolean).sort()
        });
    } catch (err) {
        console.error("ERROR fetching metadata:", err);
        res.status(500).json({ message: "Unable to get filter metadata", error: err.message });
    }
});

// --- POST: Add a single alumnus (POST /api/alumni/add-alumni) ---
router.post("/add-alumni", authMiddleware, async (req, res) => {
    try {
        const University = require('../models/University');
        const userDetails = await University.findOne({ authId: req.user.id });
        if (userDetails && userDetails.universityName) {
            req.body.collegeName = userDetails.universityName;
        }

        console.log('POST /api/alumni/add-alumni - HIT!');
        const createAlumni = await Alumni.create(req.body);
        res.status(201).json(createAlumni);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "An alumnus with that Student ID or Email already exists." });
        }
        console.error("ERROR adding alumni:", err);
        res.status(500).json({ message: "Failed to add the alumni", error: err.message });
    }
});

// --- POST: Bulk Upload Alumni (POST /api/alumni/upload) ---
router.post('/upload', authMiddleware, upload.single('alumniFile'), async (req, res) => {
    console.log('POST /api/alumni/upload - HIT!');
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }
    try {
        const University = require('../models/University');
        const userDetails = await University.findOne({ authId: req.user.id });
        const universityName = userDetails && userDetails.universityName ? userDetails.universityName : 'Chitkara University';

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
            return res.status(400).json({ message: "The Excel file is empty or formatted incorrectly." });
        }

        const validRecords = [];
        const transformedData = jsonData.map(record => {
            const mappedRecord = mapExcelKeysToSchema(record);
            
            // Basic validation for required fields
            if (mappedRecord.name && (mappedRecord.email || mappedRecord.rollNumber)) {
                
                // --- Date Conversion Fix ---
                if (mappedRecord.dob) {
                    let excelDate;
                    if (typeof mappedRecord.dob === 'number') {
                        // Handle Excel serial date format
                        excelDate = new Date(Math.round((mappedRecord.dob - 25569) * 86400 * 1000));
                    } else {
                        // Handle string dates (e.g., DD/MM/YYYY)
                        const parts = String(mappedRecord.dob).split('/');
                        if (parts.length === 3) {
                             // Assuming DD/MM/YYYY, convert to MM/DD/YYYY for Date parser
                            excelDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
                        } else {
                            excelDate = new Date(mappedRecord.dob); // Try to parse directly
                        }
                    }
                    
                    if (!isNaN(excelDate.getTime())) {
                        mappedRecord.dob = excelDate;
                    } else {
                        delete mappedRecord.dob; // Remove invalid date
                    }
                }
                
                // Default password generation (better to use bcrypt here, but for now simple string)
                 // NOTE: In production, hash this password!
                if(!mappedRecord.password) mappedRecord.password = '$2a$10$fbO6T7yB0.dDq.y/Wp/oO.j7l7W/y/Wp/oO.j7l7W'; // "changeMe" hash placeholder
                mappedRecord.collegeName = universityName;

                validRecords.push(mappedRecord);
                return mappedRecord;
            }
            return null;
        }).filter(record => record !== null);
        
        if (validRecords.length === 0) {
            return res.status(400).json({ message: "No valid alumni records found. Check your Excel headers." });
        }
        
        console.log(`Attempting to upsert ${validRecords.length} records. Sample:`, validRecords[0]);
        
        const bulkOps = validRecords.map(record => ({
            updateOne: {
                filter: { rollNumber: record.rollNumber },
                update: { $set: record },
                upsert: true
            }
        }));

        const result = await Alumni.bulkWrite(bulkOps, { ordered: false });
        res.status(201).json({ 
            message: `Successfully processed ${validRecords.length} records. Added: ${result.upsertedCount}, Updated: ${result.modifiedCount}.` 
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            const firstErrorField = Object.keys(err.errors)[0];
            const errorMessage = err.errors[firstErrorField].message;
            return res.status(400).json({
                message: `Data validation failed. Error on field '${firstErrorField}': ${errorMessage}`
            });
        }
        console.error("ERROR uploading file:", err);
        res.status(500).json({ message: "An error occurred during the upload process.", error: err.message });
    }
});

// --- PUT: Update an alumnus (PUT /api/alumni/update-alumni/:StudentId) ---
router.put('/update-alumni/:StudentId', authMiddleware, async (req, res) => {
    try {
        const { StudentId } = req.params;
        console.log(`PUT /api/alumni/update-alumni/${StudentId} - HIT!`);
        
        let updateQuery = { rollNumber: StudentId }; // Using rollNumber as it maps to StudentId in the DB
        
        const University = require('../models/University');
        const userDetails = await University.findOne({ authId: req.user.id });
        if (userDetails && userDetails.universityName) {
            updateQuery.collegeName = userDetails.universityName;
        }

        const updatedAlumni = await Alumni.findOneAndUpdate(
            updateQuery,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedAlumni) {
            return res.status(404).json({ message: "Alumni not found with that Student ID or you don't have permission" });
        }
        res.status(200).json(updatedAlumni);
    } catch (err) {
        console.error("ERROR updating alumni:", err);
        res.status(500).json({ message: "Unable to update the Alumni", error: err.message });
    }
});

// --- DELETE: Delete an alumnus (DELETE /api/alumni/delete-alumni/:StudentId) ---
router.delete('/delete-alumni/:StudentId', authMiddleware, async (req, res) => {
    try {
        const { StudentId } = req.params;
        console.log(`DELETE /api/alumni/delete-alumni/${StudentId} - HIT!`);
        
        let deleteQuery = { rollNumber: StudentId };
        
        const University = require('../models/University');
        const userDetails = await University.findOne({ authId: req.user.id });
        if (userDetails && userDetails.universityName) {
            deleteQuery.collegeName = userDetails.universityName;
        }

        const deletedAlumni = await Alumni.findOneAndDelete(deleteQuery);
        if (!deletedAlumni) {
            return res.status(404).json({ message: "Alumni with that Student ID not found or you don't have permission." });
        }
        res.status(200).json({ message: "Alumni deleted successfully." });
    } catch (err) {
        console.error("ERROR deleting alumni:", err);
        res.status(500).json({ message: "Unable to delete the Alumni", error: err.message });
    }
});

// --- POST: Upload Image (POST /api/alumni/upload-image) ---
router.post('/upload-image', async (req, res) => {
    try {
        console.log('POST /api/alumni/upload-image - HIT!');
        const { image } = req.body; // Expecting a base64 data URL
        if (!image) {
            return res.status(400).json({ message: "No image data provided." });
        }
        const result = await cloudinary.uploader.upload(image, {
            folder: 'alumni_profiles',
        });
        res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.error("ERROR uploading image to Cloudinary:", err);
        res.status(500).json({ message: "Image upload failed.", error: err.message });
    }
});

// --- MERGED ROUTES FROM alumni.js ---

// [GET] /api/alumni/search - Search alumni by name, skills, company, etc.
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { q, industry, graduationYear, limit = 20 } = req.query;
        
        let query = {}; 
        
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
