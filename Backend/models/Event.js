const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
        type: String, // e.g., "2 hours", "90 minutes"
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
    meetingId: {
        type: String // For Google Meet integration
    },
    organizer: {
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
    maxAttendees: {
        type: Number,
        default: 100,
        min: 1
    },
    currentAttendees: {
        type: Number,
        default: 0
    },
    attendees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        attended: {
            type: Boolean,
            default: false
        }
    }],
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
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    rejectionReason: {
        type: String
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    feedback: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }],
    reminderSent: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Indexes for performance
eventSchema.index({ organizer: 1 });
eventSchema.index({ university: 1 });
eventSchema.index({ collegeName: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ format: 1 });

module.exports = mongoose.model('Event', eventSchema);
