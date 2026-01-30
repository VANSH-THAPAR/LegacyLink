const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for fast retrieval of conversation history
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ recipient: 1, sender: 1 });

module.exports = mongoose.model('Message', messageSchema);
