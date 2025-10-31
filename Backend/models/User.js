const mongoose = require('mongoose');

// Base User Schema for common fields
const BaseUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, required: true },
    profilePicture: { type: String, default: '' },
    rollNumber: { type: String, unique: true, sparse: true, required: true },
    password: { type: String, required: true },
    collegeName: { type: String },
    universityName: { type: String },
    graduatingYear: { type: Number }
}, { timestamps: true });

// Student Schema
const StudentSchema = new mongoose.Schema({
    ...BaseUserSchema.obj,
    role: { type: String, default: 'student' },
    course: { type: String },
    year: { type: String },
    interests: { type: [String], default: [] }
}, { timestamps: true });

// Add indexes for faster login queries
StudentSchema.index({ email: 1 });
StudentSchema.index({ rollNumber: 1 });
StudentSchema.index({ email: 1, rollNumber: 1 });

// Alumni Schema
const AlumniSchema = new mongoose.Schema({
    ...BaseUserSchema.obj,
    role: { type: String, default: 'alumni' },
    position: { type: String },
    company: { type: String },
    industry: { type: String },
    skills: { type: [String], default: [] },
    bio: { type: String },
    linkedin: { type: String },
    location: { type: String },
    isTopContributor: { type: Boolean, default: false },
    engagementScore: { type: Number, default: 0 },
    
    // Mentorship fields
    isMentor: { type: Boolean, default: false },
    mentorshipAreas: { type: [String], default: [] },
    maxMentees: { type: Number, default: 5 }
}, { timestamps: true });

// Add indexes for faster login queries
AlumniSchema.index({ email: 1 });
AlumniSchema.index({ rollNumber: 1 });
AlumniSchema.index({ email: 1, rollNumber: 1 });

// University Schema (keeping for completeness)
const UniversitySchema = new mongoose.Schema({
    role: { type: String, default: 'university' },
    universityName: { type: String, required: true },
    universityId: { type: String, unique: true, required: true },
    password: { type: String, required: true }
}, { timestamps: true });

// Add index for faster university login queries
UniversitySchema.index({ universityId: 1 });

// Clear any existing models to avoid conflicts
if (mongoose.models.Student) delete mongoose.models.Student;
if (mongoose.models.Alumni) delete mongoose.models.Alumni;
if (mongoose.models.University) delete mongoose.models.University;

module.exports = {
    Student: mongoose.model('Student', StudentSchema),
    Alumni: mongoose.model('Alumni', AlumniSchema),
    University: mongoose.model('University', UniversitySchema)
};