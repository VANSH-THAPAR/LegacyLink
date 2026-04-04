const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Make false to support Registration requests before user exists
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
    },
    isRegistration: {
        type: Boolean,
        default: false
    },
    registrationData: {
        type: Object,
        default: {}
    },
    idProofUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
