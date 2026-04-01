const mongoose = require('mongoose');

// Base User Schema
const BaseUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        unique: true, 
        sparse: true, 
        // Email is required for students and alumni, but maybe not university if they use ID
        required: function() { return this.role !== 'university'; } 
    },
    profilePicture: { type: String, default: '' },
    rollNumber: { 
        type: String, 
        unique: true, 
        sparse: true, 
        // rollNumber is required for student/alumni
        required: function() { return this.role !== 'university'; }
    }, 
    password: { type: String, required: true },
    collegeName: { type: String },
    universityName: { type: String }, // Can be used for University users
    graduatingYear: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    contactNumber: { type: String },
    about: { type: String },
    role: { type: String, required: true, enum: ['student', 'alumni', 'university', 'admin'] }
}, { timestamps: true, discriminatorKey: 'role' });

// Add indexes
BaseUserSchema.index({ email: 1 });
BaseUserSchema.index({ rollNumber: 1 });

let User;
try {
    User = mongoose.model('User');
} catch {
    User = mongoose.model('User', BaseUserSchema);
}

// Student Schema (Discriminator)
const StudentSchema = new mongoose.Schema({
    course: { type: String },
    year: { type: String },
    interests: { type: [String], default: [] },
    cgpa: { type: Number, min: 0, max: 10 },
    backlogs: { type: Number, min: 0, default: 0 },
    phone: { type: String },
    semester: { type: String },
    // Fields from old student.js
    fatherName: String,
    motherName: String,
    nationality: String,
    dob: Date,
    batchYear: Number,
    degreeProgram: String
});

const Student = User.discriminators?.student || User.discriminator('student', StudentSchema);

// Alumni Schema (Discriminator)
const AlumniSchema = new mongoose.Schema({
    position: { type: String },
    company: { type: String },
    industry: { type: String },
    skills: { type: [String], default: [] },
    bio: { type: String },
    linkedin: { type: String },
    location: { type: String },
    isTopContributor: { type: Boolean, default: false },
    engagementScore: { type: Number, default: 0 },
    isMentor: { type: Boolean, default: false },
    mentorshipAreas: { type: [String], default: [] },
    maxMentees: { type: Number, default: 5 },
    // Fields from old alumni.js
    profession: String,
    CompanyName: String,
    LinkedInURL: String,
    batchYear: Number,
    degreeProgram: String,
    // Added fields to match upload format
    fatherName: String,
    motherName: String,
    nationality: String,
    dob: Date,
    personalEmail: String
});

const Alumni = User.discriminators?.alumni || User.discriminator('alumni', AlumniSchema);

// University Schema (Discriminator)
const UniversitySchema = new mongoose.Schema({
    universityId: { type: String, unique: true, sparse: true }
});

const University = User.discriminators?.university || User.discriminator('university', UniversitySchema);

module.exports = {
    User,
    Student,
    Alumni,
    University
};
