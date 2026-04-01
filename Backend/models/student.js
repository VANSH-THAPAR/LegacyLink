const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    collegeName: {
        type: String,
        required: true,
        trim: true
    },
    course: {
        type: String,
        trim: true
    },
    year: {
        type: String,
        trim: true
    },
    semester: {
        type: String,
        trim: true
    },
    graduatingYear: {
        type: Number
    },
    cgpa: {
        type: Number,
        min: 0,
        max: 10
    },
    backlogs: {
        type: Number,
        min: 0,
        default: 0
    },
    
    // Contact Information
    phone: {
        type: String,
        trim: true
    },
    contactNumber: {
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
    interests: {
        type: [String],
        default: []
    },
    
    // Social/Professional
    linkedin: {
        type: String,
        trim: true
    },
    
    // Status
    isVerified: {
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
    }
}, {
    timestamps: true
});

// Indexes for performance
studentSchema.index({ authId: 1 });
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ collegeName: 1 });
studentSchema.index({ graduatingYear: 1 });

module.exports = mongoose.model('Student', studentSchema);
