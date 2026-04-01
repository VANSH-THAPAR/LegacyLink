const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
    
    // University Information
    universityId: {
        type: String,
        required: true,
        trim: true
    },
    universityName: {
        type: String,
        required: true,
        trim: true
    },
    
    // Contact Information
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    
    // Admin Details
    position: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    accessLevel: {
        type: String,
        enum: ['super_admin', 'admin', 'moderator'],
        default: 'admin'
    },
    
    // Personal Details
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
    }
}, {
    timestamps: true
});

// Indexes for performance
adminSchema.index({ authId: 1 });
adminSchema.index({ universityId: 1 });
adminSchema.index({ universityName: 1 });
adminSchema.index({ accessLevel: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ isVerified: 1 });

module.exports = mongoose.model('Admin', adminSchema);
