const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['internship', 'job', 'collaboration', 'project']
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    companyLogo: {
        type: String, // URL or base64
        default: ''
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collegeName: {
        type: String, // Added to filter by college
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    locationType: {
        type: String,
        enum: ['on-site', 'remote', 'hybrid'],
        default: 'on-site'
    },
    stipend: {
        type: String,
        trim: true
    },
    duration: {
        type: String,
        trim: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    applyLink: {
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        trim: true
    },
    linkedinUrl: {
        type: String,
        trim: true
    },
    deadline: {
        type: Date
    },
    category: {
        type: String,
        enum: ['tech', 'marketing', 'design', 'management', 'finance', 'operations', 'other'],
        default: 'other'
    },
    experienceLevel: {
        type: String,
        enum: ['entry', 'intermediate', 'senior', 'any'],
        default: 'any'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    applications: {
        type: Number,
        default: 0
    },
    bookmarkedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
opportunitySchema.index({ type: 1, isActive: 1 });
opportunitySchema.index({ postedBy: 1 });
opportunitySchema.index({ createdAt: -1 });
opportunitySchema.index({ deadline: 1 });
opportunitySchema.index({ skills: 1 });
opportunitySchema.index({ category: 1 });

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

module.exports = Opportunity;
