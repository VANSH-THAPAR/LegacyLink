const express = require('express');
const router = express.Router();
const Alumni = require('../models/alumni');
const multer = require('multer');
const xlsx = require('xlsx');
const cloudinary = require('cloudinary').v2;

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Helper function for Excel key mapping (CASE-INSENSITIVE) ---
const mapExcelKeysToSchema = (record) => {
    const schemaKeyMap = {
        studentid: 'StudentId',
        linkedinurl: 'LinkedInURL',
        profilepicture: 'ProfilePicture',
        companyname: 'CompanyName',
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
        profession: 'profession',
        batchyear: 'batchYear',
        degreeprogram: 'degreeProgram'
    };
    
    const newRecord = {};
    for (const key in record) {
        const lowerCaseKey = key.toLowerCase().replace(/ /g, ''); // Also remove spaces
        const newKey = schemaKeyMap[lowerCaseKey];
        if (newKey) {
            newRecord[newKey] = record[key];
        }
    }
    return newRecord;
};

// --- GET: Fetch alumni (GET /api/alumni/get-alumni) ---
router.get('/get-alumni', async (req, res) => {
    try {
        const stringSearchFields = ['name', 'StudentId', 'universityEmail', 'personalEmail', 'degreeProgram', 'profession', 'CompanyName', 'nationality'];
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
        console.log('GET /api/alumni/get-alumni - HIT! Query:', query);
        const findAlumni = await Alumni.find(query);
        res.status(200).json(findAlumni);
    } catch (err) {
        console.error("ERROR fetching alumni:", err); 
        res.status(500).json({ message: "Unable to get alumni", error: err.message });
    }
});

// --- GET: Metadata for filters (GET /api/alumni/metadata) ---
router.get('/metadata', async (req, res) => {
    try {
        console.log('GET /api/alumni/metadata - HIT!');
        const [batchYears, degreePrograms, genders, professions] = await Promise.all([
            Alumni.distinct('batchYear'),
            Alumni.distinct('degreeProgram'),
            Alumni.distinct('gender'),
            Alumni.distinct('profession')
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
router.post("/add-alumni", async (req, res) => {
    try {
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
router.post('/upload', upload.single('alumniFile'), async (req, res) => {
    console.log('POST /api/alumni/upload - HIT!');
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
            return res.status(400).json({ message: "The Excel file is empty or formatted incorrectly." });
        }

        const transformedData = jsonData.map(record => {
            const mappedRecord = mapExcelKeysToSchema(record);
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
                    console.warn(`Invalid date format for record: ${mappedRecord.StudentId || 'Unknown'}. DOB: ${mappedRecord.dob}`);
                    delete mappedRecord.dob; // Remove invalid date
                }
            }
            return mappedRecord;
        });
        
        console.log("Attempting to insert transformed data sample (first row):", transformedData[0]);
        const result = await Alumni.insertMany(transformedData, { ordered: false });
        res.status(201).json({ message: `Successfully added ${result.length} new alumni.` });

    } catch (err) {
        if (err.name === 'MongoBulkWriteError' && err.code === 11000) {
            const insertedCount = err.result ? err.result.nInserted : 0;
            const errorCount = err.writeErrors ? err.writeErrors.length : 0;
            return res.status(207).json({ 
                message: `Partial success. Added ${insertedCount} new alumni, but ${errorCount} duplicates were found and ignored.`
            });
        }
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
router.put('/update-alumni/:StudentId', async (req, res) => {
    try {
        const { StudentId } = req.params;
        console.log(`PUT /api/alumni/update-alumni/${StudentId} - HIT!`);
        const updatedAlumni = await Alumni.findOneAndUpdate(
            { StudentId: StudentId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedAlumni) {
            return res.status(404).json({ message: "Alumni not found with that Student ID" });
        }
        res.status(200).json(updatedAlumni);
    } catch (err) {
        console.error("ERROR updating alumni:", err);
        res.status(500).json({ message: "Unable to update the Alumni", error: err.message });
    }
});

// --- DELETE: Delete an alumnus (DELETE /api/alumni/delete-alumni/:StudentId) ---
router.delete('/delete-alumni/:StudentId', async (req, res) => {
    try {
        const { StudentId } = req.params;
        console.log(`DELETE /api/alumni/delete-alumni/${StudentId} - HIT!`);
        const deletedAlumni = await Alumni.findOneAndDelete({ StudentId: StudentId });
        if (!deletedAlumni) {
            return res.status(404).json({ message: "Alumni with that Student ID not found." });
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

module.exports = router;
