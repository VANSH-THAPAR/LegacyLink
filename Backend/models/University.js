const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
    // Reference to AuthUser
    authId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'AuthUser'
    },
    
    // University Information
    universityName: {
        type: String,
        required: true,
        trim: true
    },
    universityId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    
    // Contact Information
    phone: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    
    // University Details
    type: {
        type: String,
        enum: ['Public', 'Private', 'Deemed'],
        default: 'Private'
    },
    established: {
        type: Number
    },
    website: {
        type: String,
        trim: true
    },
    
    // Admin Information
    adminName: {
        type: String,
        trim: true
    },
    adminPosition: {
        type: String,
        trim: true
    },
    
    // Description
    about: {
        type: String,
        trim: true
    },
    
    // Status
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Statistics
    totalStudents: {
        type: Number,
        default: 0
    },
    totalAlumni: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for performance
universitySchema.index({ authId: 1 });
universitySchema.index({ universityId: 1 });
universitySchema.index({ email: 1 });
universitySchema.index({ universityName: 1 });

module.exports = mongoose.model('University', universitySchema);
