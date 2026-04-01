const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    senderRole: {
        type: String,
        enum: ['student', 'alumni'],
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, readBy: 1 });
messageSchema.index({ 'readBy.userId': 1 });

// Virtual for checking if message is read by all participants
messageSchema.virtual('isReadByAll').get(function() {
    return this.readBy.length > 1; // Assuming at least 2 participants
});

// Static method to get unread count for user
messageSchema.statics.getUnreadCount = async function(userId) {
    return await this.countDocuments({
        conversationId: { $in: await this.model('Conversation').getUserConversationIds(userId) },
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId },
        isDeleted: false
    });
};

module.exports = mongoose.model('Message', messageSchema);
