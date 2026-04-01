const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        role: {
            type: String,
            enum: ['student', 'alumni'],
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        lastReadAt: {
            type: Date,
            default: Date.now
        },
        unreadCount: {
            type: Number,
            default: 0
        }
    }],
    lastMessage: {
        type: String,
        trim: true,
        maxlength: 100
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastMessageBy: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        totalMessages: {
            type: Number,
            default: 0
        },
        lastActivity: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound indexes for performance
conversationSchema.index({ 'participants.userId': 1, lastMessageAt: -1 });
conversationSchema.index({ 'participants.userId': 1, isActive: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Unique index to prevent duplicate conversations between same participants
conversationSchema.index({
    'participants.userId': 1
}, { 
    unique: true,
    partialFilterExpression: { 
        isActive: true,
        'participants.2': { $exists: false } // Only for 2-person conversations
    }
});

// Virtual for getting other participant in 2-person conversation
conversationSchema.virtual('otherParticipant').get(function() {
    if (this.participants.length === 2) {
        return this.participants.find(p => p.userId.toString() !== this.currentUserId);
    }
    return null;
});

// Static method to find or create conversation between two users
conversationSchema.statics.findOrCreate = async function(participants) {
    // Sort participants to ensure consistent querying
    const sortedParticipants = participants.sort((a, b) => 
        a.userId.toString().localeCompare(b.userId.toString())
    );

    // Try to find existing conversation
    let conversation = await this.findOne({
        'participants.userId': { $all: sortedParticipants.map(p => p.userId) },
        isActive: true
    }).populate('participants.userId', 'name profilePicture');

    if (!conversation) {
        // Create new conversation
        conversation = new this({
            participants: sortedParticipants,
            lastMessage: 'No messages yet',
            lastMessageAt: new Date()
        });
        await conversation.save();
        await conversation.populate('participants.userId', 'name profilePicture');
    }

    return conversation;
};

// Static method to get user's conversations
conversationSchema.statics.getUserConversations = async function(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const conversations = await this.find({
        'participants.userId': userId,
        isActive: true
    })
    .populate('participants.userId', 'name profilePicture')
    .populate('lastMessageBy', 'name')
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit);

    return conversations;
};

// Static method to get user conversation IDs
conversationSchema.statics.getUserConversationIds = async function(userId) {
    const conversations = await this.find({
        'participants.userId': userId,
        isActive: true
    }).select('_id');

    return conversations.map(conv => conv._id);
};

// Instance method to update unread count
conversationSchema.methods.updateUnreadCount = async function(userId, increment = 1) {
    const participant = this.participants.find(p => 
        p.userId.toString() === userId.toString()
    );
    
    if (participant) {
        participant.unreadCount += increment;
        participant.lastReadAt = new Date();
        return await this.save();
    }
    
    return this;
};

// Instance method to mark messages as read
conversationSchema.methods.markAsRead = async function(userId) {
    const participant = this.participants.find(p => 
        p.userId.toString() === userId.toString()
    );
    
    if (participant) {
        participant.unreadCount = 0;
        participant.lastReadAt = new Date();
        return await this.save();
    }
    
    return this;
};

module.exports = mongoose.model('Conversation', conversationSchema);
