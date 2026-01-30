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
        required: true, // Workshop, Seminar, etc.
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String // e.g., "10:00 AM"
    },
    location: {
        type: String,
        required: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collegeName: {
        type: String,
        required: true // For scoping
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    maxAttendees: {
        type: Number,
        default: 100
    },
    imageUrl: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
