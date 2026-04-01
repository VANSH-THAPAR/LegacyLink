const express = require('express');
const router = express.Router();
const Student = require('../models/student'); // <-- Use Student model
const multer = require('multer');
const xlsx = require('xlsx');
const cloudinary = require('cloudinary').v2;

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Helper function for Student Excel key mapping (CASE-INSENSITIVE) ---
const mapExcelKeysToSchema = (record) => {
    const schemaKeyMap = {
        studentid: 'StudentId',
        profilepicture: 'ProfilePicture',
        name: 'name',
        universityemail: 'universityEmail',
        personalemail: 'personalEmail',
        contactnumber: 'contactNumber',
        fathername: 'fatherName',
        mothername: 'motherName',
        nationality: 'nationality',
        gender: 'gender',
        role: 'role',
        dob: 'dob',
        batchyear: 'batchYear',
        degreeprogram: 'degreeProgram'
        // --- No profession/company keys ---
    };
    
    const newRecord = {};
    for (const key in record) {
        const lowerCaseKey = key.toLowerCase().replace(/ /g, '');
        const newKey = schemaKeyMap[lowerCaseKey];
        if (newKey) {
            newRecord[newKey] = record[key];
        }
    }
    return newRecord;
};

// --- GET: Fetch students (GET /api/students/get-students) ---
router.get('/get-students', async (req, res) => {
    try {
        // --- Simplified search fields ---
        const stringSearchFields = ['name', 'StudentId', 'universityEmail', 'personalEmail', 'degreeProgram', 'nationality'];
        const query = {};
        for (const key in req.query) {
            if (Object.prototype.hasOwnProperty.call(req.query, key) && req.query[key]) {
                if (stringSearchFields.includes(key)) {
                    query[key] = { $regex: new RegExp(req.query[key], 'i') };
                } else {
                    query[key] = req.query[key];
                }
            }
        }
        console.log('GET /api/students/get-students - HIT! Query:', query);
        const findStudents = await Student.find(query); // <-- Use Student model
        res.status(200).json(findStudents);
    } catch (err) {
        console.error("ERROR fetching students:", err); 
        res.status(500).json({ message: "Unable to get students", error: err.message });
    }
});

// --- GET: Metadata for filters (GET /api/students/metadata) ---
router.get('/metadata', async (req, res) => {
    try {
        console.log('GET /api/students/metadata - HIT!');
        // --- Simplified metadata ---
        const [batchYears, degreePrograms, genders] = await Promise.all([
            Student.distinct('batchYear'),
            Student.distinct('degreeProgram'),
            Student.distinct('gender')
        ]);
        res.status(200).json({
            batchYears: batchYears.filter(Boolean).sort((a, b) => b - a),
            degreePrograms: degreePrograms.filter(Boolean).sort(),
            genders: genders.filter(Boolean).sort(),
            // --- No professions ---
        });
    } catch (err) {
        console.error("ERROR fetching student metadata:", err);
        res.status(500).json({ message: "Unable to get filter metadata", error: err.message });
    }
});

// --- POST: Add a single student (POST /api/students/add-student) ---
router.post("/add-student", async (req, res) => {
    try {
        console.log('POST /api/students/add-student - HIT!');
        const createStudent = await Student.create(req.body); // <-- Use Student model
        res.status(201).json(createStudent);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "A student with that Student ID or Email already exists." });
        }
        console.error("ERROR adding student:", err);
        res.status(500).json({ message: "Failed to add the student", error: err.message });
    }
});

// --- POST: Bulk Upload Students (POST /api/students/upload) ---
router.post('/upload', upload.single('studentFile'), async (req, res) => {
    console.log('POST /api/students/upload - HIT!');
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded. Make sure the form field name is 'studentFile'." });
    }
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);   

        if (jsonData.length === 0) {
            return res.status(400).json({ message: "The Excel file is empty or formatted incorrectly." });
        }

        // --- Use Student data transformation ---
        const transformedData = jsonData.map(record => {
            const mappedRecord = mapExcelKeysToSchema(record);
            if (mappedRecord.dob) {
                let excelDate;
                if (typeof mappedRecord.dob === 'number') {
                    excelDate = new Date(Math.round((mappedRecord.dob - 25569) * 86400 * 1000));
                } else {
                    const parts = String(mappedRecord.dob).split('/');
                    if (parts.length === 3) {
                        excelDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
                    } else {
                        excelDate = new Date(mappedRecord.dob);
                    }
                }
                
                if (!isNaN(excelDate.getTime())) {
                    mappedRecord.dob = excelDate;
                } else {
                    delete mappedRecord.dob; 
                }
            }
            return mappedRecord;
        });
        
        const result = await Student.insertMany(transformedData, { ordered: false }); // <-- Use Student model
        res.status(201).json({ message: `Successfully added ${result.length} new students.` });

    } catch (err) {
        if (err.name === 'MongoBulkWriteError' && err.code === 11000) {
            const insertedCount = err.result ? err.result.nInserted : 0;
            const errorCount = err.writeErrors ? err.writeErrors.length : 0;
            return res.status(207).json({ 
                message: `Partial success. Added ${insertedCount} new students, but ${errorCount} duplicates were ignored.`
            });
        }
        if (err.name === 'ValidationError') {
            const firstErrorField = Object.keys(err.errors)[0];
            const errorMessage = err.errors[firstErrorField].message;
            return res.status(400).json({
                message: `Data validation failed. Error on field '${firstErrorField}': ${errorMessage}`
            });
        }
        console.error("ERROR uploading student file:", err);
        res.status(500).json({ message: "An error occurred during the upload process.", error: err.message });
    }
});

// --- PUT: Update a student (PUT /api/students/update-student/:StudentId) ---
router.put('/update-student/:StudentId', async (req, res) => {
    try {
        const { StudentId } = req.params;
        console.log(`PUT /api/students/update-student/${StudentId} - HIT!`);
        const updatedStudent = await Student.findOneAndUpdate(
            { StudentId: StudentId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found with that Student ID" });
        }
        res.status(200).json(updatedStudent);
    } catch (err) {
        console.error("ERROR updating student:", err);
        res.status(500).json({ message: "Unable to update the Student", error: err.message });
    }
});

// --- DELETE: Delete a student (DELETE /api/students/delete-student/:StudentId) ---
router.delete('/delete-student/:StudentId', async (req, res) => {
    try {
        const { StudentId } = req.params;
        console.log(`DELETE /api/students/delete-student/${StudentId} - HIT!`);
        const deletedStudent = await Student.findOneAndDelete({ StudentId: StudentId });
        if (!deletedStudent) {
            return res.status(404).json({ message: "Student with that Student ID not found." });
        }
        res.status(200).json({ message: "Student deleted successfully." });
    } catch (err) {
        console.error("ERROR deleting student:", err);
        res.status(500).json({ message: "Unable to delete the Student", error: err.message });
    }
});

// --- POST: Upload Image (POST /api/students/upload-image) ---
router.post('/upload-image', async (req, res) => {
    try {
        console.log('POST /api/students/upload-image - HIT!');
        const { image } = req.body; 
        if (!image) {
            return res.status(400).json({ message: "No image data provided." });
        }
        const result = await cloudinary.uploader.upload(image, {
            folder: 'student_profiles', // <-- Different folder
        });
        res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.error("ERROR uploading image to Cloudinary:", err);
        res.status(500).json({ message: "Image upload failed.", error: err.message });
    }
});

module.exports = router;
