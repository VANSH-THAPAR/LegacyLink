// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
        sparse: true
    },
    contactNumber: String,
    fatherName: String,
    motherName: String,
    nationality: String,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    role: {
        type: String,
        default: 'student'
    },
    ProfilePicture: String,
    dob: Date,
    // Students typically don't have these, but you can add them if needed
    // profession: String, 
    // CompanyName: String,
    // LinkedInURL: String,
    batchYear: {
        type: Number,
        required: true
    },
    degreeProgram: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});
<<<<<<< HEAD:Backend/models/student.js

const Student = mongoose.model('Student',studentSchema);
=======
// Check if model already exists to prevent OverwriteModelError
const Student = mongoose.models.Student || mongoose.model('Student',studentSchema);
>>>>>>> task-2:Backend/models/studentSchema.js
module.exports = Student;