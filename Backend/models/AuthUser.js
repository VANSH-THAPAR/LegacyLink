const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    rollNumber: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'alumni', 'admin', 'university']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for performance
authUserSchema.index({ email: 1 });
authUserSchema.index({ rollNumber: 1 });
authUserSchema.index({ role: 1 });
authUserSchema.index({ isActive: 1 });

module.exports = mongoose.model('AuthUser', authUserSchema);
