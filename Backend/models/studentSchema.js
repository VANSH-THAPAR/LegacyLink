const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // A name should always be required.
    },
    StudentId: {
        type: String,
        unique: true,
        required: true,  
    },
    universityEmail: {
        type: String,
        unique: true,
        required: true,
    },
    personalEmail: {
        type: String,
        unique: true,
        sparse: true // Enforces uniqueness only if the field exists.
    },
    contactNumber: String,
    fatherName: String,
    motherName: String,
    nationality: String,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'] // Ensures data consistency.
    },
    role: {
        type: String,
        default: 'student' // Sets a default role for new entries.
    },
    ProfilePicture: String,
    dob: Date,
    profession: String,
    CompanyName: String,
    batchYear: {
        type: Number, // CHANGED: Storing year as a number is better for sorting and queries.
        required: true
    },
    degreeProgram: {
        type: String,
        required: true
    },
    LinkedInURL: String, // Corrected casing for consistency
}, {
    timestamps: true
});
// Check if model already exists to prevent OverwriteModelError
const Student = mongoose.models.Student || mongoose.model('Student',studentSchema);
module.exports = Student;