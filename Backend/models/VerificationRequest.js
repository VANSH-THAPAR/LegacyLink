const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Dynamic reference not strictly needed for just fetching requests unless populating
        refPath: 'userModel' 
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Student', 'Alumni']
    },
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    }, // e.g., 'Alumni Registration', 'Student Verification'
    avatar: { 
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
