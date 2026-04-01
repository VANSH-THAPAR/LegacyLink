const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
    // Reference to AuthUser
    authId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'AuthUser'
    },
    
    // Personal Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    
    // Academic Information
    rollNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    collegeName: {
        type: String,
        required: true,
        trim: true
    },
    degreeProgram: {
        type: String,
        trim: true
    },
    batchYear: {
        type: Number
    },
    graduatingYear: {
        type: Number
    },
    
    // Professional Information
    company: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    experience: {
        type: Number,
        default: 0
    },
    skills: {
        type: [String],
        default: []
    },
    
    // Contact Information
    personalEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    
    // Personal Details
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    about: {
        type: String,
        trim: true
    },
    linkedin: {
        type: String,
        trim: true
    },
    
    // Family Information
    fatherName: {
        type: String,
        trim: true
    },
    motherName: {
        type: String,
        trim: true
    },
    nationality: {
        type: String,
        trim: true
    },
    dob: {
        type: Date
    },
    
    // Status
    isVerified: {
        type: Boolean,
        default: false
    },
    isTopContributor: {
        type: Boolean,
        default: false
    },
    
    // Engagement Metrics
    profileViews: {
        type: Number,
        default: 0
    },
    mentorshipRequests: {
        type: Number,
        default: 0
    },
    engagementScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for performance
alumniSchema.index({ authId: 1 });
alumniSchema.index({ rollNumber: 1 });
alumniSchema.index({ email: 1 });
alumniSchema.index({ collegeName: 1 });
alumniSchema.index({ batchYear: 1 });
alumniSchema.index({ industry: 1 });

module.exports = mongoose.model('Alumni', alumniSchema);
