const mongoose = require('mongoose');

const eventRequestSchema = new mongoose.Schema({
    // Event Details
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
        enum: ['Workshop', 'Seminar', 'Webinar', 'Conference', 'Networking', 'Career Fair', 'Guest Lecture', 'Training', 'Other']
    },
    format: {
        type: String,
        required: true,
        enum: ['Online', 'Offline', 'Hybrid']
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: function() { return this.format === 'Offline' || this.format === 'Hybrid'; }
    },
    venue: {
        type: String,
        required: function() { return this.format === 'Offline' || this.format === 'Hybrid'; }
    },
    onlineMeetingLink: {
        type: String,
        required: function() { return this.format === 'Online' || this.format === 'Hybrid'; }
    },
    maxAttendees: {
        type: Number,
        default: 100,
        min: 1
    },
    tags: [{
        type: String,
        trim: true
    }],
    prerequisites: [{
        type: String,
        trim: true
    }],
    learningOutcomes: [{
        type: String,
        trim: true
    }],
    materials: [{
        name: String,
        url: String,
        type: {
            type: String,
            enum: ['Document', 'Video', 'Link', 'Other']
        }
    }],
    imageUrl: {
        type: String
    },

    // Request Details
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    },
    collegeName: {
        type: String,
        required: true
    },

    // Approval Workflow
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Resubmission Required'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    
    // Review Process
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    reviewComments: {
        type: String
    },
    rejectionReason: {
        type: String
    },
    resubmissionDeadline: {
        type: Date
    },
    
    // Approval Details
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    approvalComments: {
        type: String
    },
    
    // Google Meet Integration
    googleMeetRequested: {
        type: Boolean,
        default: false
    },
    googleMeetApproved: {
        type: Boolean,
        default: false
    },
    
    // Communication
    reminderSent: {
        type: Boolean,
        default: false
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    
    // Related Event (after approval)
    relatedEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    
    // Request History
    history: [{
        action: {
            type: String,
            enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Resubmission Required', 'Withdrawn']
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        comments: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Indexes for performance
eventRequestSchema.index({ requester: 1 });
eventRequestSchema.index({ university: 1 });
eventRequestSchema.index({ collegeName: 1 });
eventRequestSchema.index({ status: 1 });
eventRequestSchema.index({ date: 1 });
eventRequestSchema.index({ priority: 1 });
eventRequestSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('EventRequest', eventRequestSchema);
