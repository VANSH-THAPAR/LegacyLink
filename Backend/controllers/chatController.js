const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Student = require('../models/student');
const Alumni = require('../models/alumni');

// Get user's conversations (like WhatsApp chat list)
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const conversations = await Conversation.getUserConversations(currentUserId, page, limit);

        // Get unread counts for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const participant = conv.participants.find(p => 
                    p.userId.toString() === currentUserId.toString()
                );
                
                return {
                    ...conv.toObject(),
                    unreadCount: participant ? participant.unreadCount : 0,
                    lastReadAt: participant ? participant.lastReadAt : null
                };
            })
        );

        res.json({
            conversations: conversationsWithUnread,
            page,
            totalPages: Math.ceil(await Conversation.countDocuments({
                'participants.userId': currentUserId,
                isActive: true
            }) / limit)
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Get messages in a conversation with pagination
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const currentUserId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        // Verify user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }

        const isParticipant = conversation.participants.some(
            p => p.userId.toString() === currentUserId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({ msg: 'Not authorized to view this conversation' });
        }

        // Get messages with pagination
        const skip = (page - 1) * limit;
        const messages = await Message.find({
            conversationId,
            isDeleted: false
        })
        .populate('senderId', 'name profilePicture')
        .populate('replyTo', 'content senderId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        // Reverse to show oldest first
        messages.reverse();

        // Mark conversation as read
        await conversation.markAsRead(currentUserId);

        res.json({
            messages,
            page,
            totalPages: Math.ceil(await Message.countDocuments({
                conversationId,
                isDeleted: false
            }) / limit)
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Start or get conversation with another user
exports.startConversation = async (req, res) => {
    try {
        const { userId, userRole } = req.body;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        console.log(' Start conversation request:', {
            userId,
            userRole,
            currentUserId,
            currentUserRole
        });

        // Allow all users to chat (connection validation removed)
        console.log('✅ Allowing conversation - connection validation disabled');

        // Check if conversation already exists
        const existingConversation = await Conversation.findOne({
            participants: {
                $all: [
                    { userId: currentUserId },
                    { userId: userId }
                ]
            }
        }).populate('participants.userId', 'name profilePicture');

        if (existingConversation) {
            return res.json(existingConversation);
        }

        // Find or create conversation
        const participants = [
            { userId: currentUserId, role: currentUserRole },
            { userId: userId, role: userRole }
        ];

        const conversation = await Conversation.findOrCreate(participants);

        res.json(conversation);
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Search users to start conversation with
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        
        // Debug logging
        console.log('Search request - Query:', query);
        console.log('Search request - User object:', req.user);

        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        console.log('Current user ID:', currentUserId);
        console.log('Current user role:', currentUserRole);

        if (!query) {
            return res.status(400).json({ msg: 'Search query is required' });
        }

        let searchResults = [];

        // Students can search alumni, alumni can search students
        if (currentUserRole === 'student') {
            console.log('Searching for alumni with query:', query);
            searchResults = await Alumni.find({
                name: { $regex: query, $options: 'i' }
                // Removed isVerified requirement for testing
            })
            .select('name profilePicture rollNumber company position industry')
            .limit(10);
            
            console.log('Found alumni results:', searchResults.length);
        } else if (currentUserRole === 'alumni') {
            console.log('Searching for students with query:', query);
            searchResults = await Student.find({
                name: { $regex: query, $options: 'i' }
                // Removed isVerified requirement for testing
            })
            .select('name profilePicture rollNumber course graduatingYear')
            .limit(10);
            
            console.log('Found student results:', searchResults.length);
        }

        // Add role to results
        const resultsWithRole = searchResults.map(user => ({
            ...user.toObject(),
            role: currentUserRole === 'student' ? 'alumni' : 'student'
        }));

        console.log('Returning search results:', resultsWithRole.length);
        res.json(resultsWithRole);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Send message via HTTP (fallback for Socket.IO)
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, content, messageType = 'text' } = req.body;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        if (!conversationId || !content) {
            return res.status(400).json({ msg: 'Conversation ID and content are required' });
        }

        // Verify conversation and participation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }

        const isParticipant = conversation.participants.some(
            p => p.userId.toString() === currentUserId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({ msg: 'Not authorized to send messages in this conversation' });
        }

        // Create message
        const message = new Message({
            conversationId,
            senderId: currentUserId,
            senderRole: currentUserRole,
            content: content.trim(),
            messageType
        });

        // Add sender to readBy array
        message.readBy.push({
            userId: currentUserId,
            readAt: new Date()
        });

        await message.save();

        // Update conversation
        conversation.lastMessage = content.length > 100 ? content.substring(0, 100) + '...' : content;
        conversation.lastMessageAt = new Date();
        conversation.lastMessageBy = currentUserId;
        conversation.metadata.totalMessages += 1;
        conversation.metadata.lastActivity = new Date();

        // Update unread count for other participants
        for (const participant of conversation.participants) {
            if (participant.userId.toString() !== currentUserId.toString()) {
                participant.unreadCount += 1;
            }
        }

        await conversation.save();

        // Populate message details
        await message.populate('senderId', 'name profilePicture');

        res.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.body;
        const currentUserId = req.user.id;

        if (!messageId) {
            return res.status(400).json({ msg: 'Message ID is required' });
        }

        const message = await Message.findById(messageId).populate('conversationId');
        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        // Check if user is participant
        const conversation = message.conversationId;
        const isParticipant = conversation.participants.some(
            p => p.userId.toString() === currentUserId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({ msg: 'Not authorized to mark this message as read' });
        }

        // Add user to readBy if not already there
        const alreadyRead = message.readBy.some(
            read => read.userId.toString() === currentUserId.toString()
        );

        if (!alreadyRead) {
            message.readBy.push({
                userId: currentUserId,
                readAt: new Date()
            });
            await message.save();

            // Update conversation unread count
            await conversation.markAsRead(currentUserId);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Delete message
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const currentUserId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        // Only sender can delete their own messages
        if (message.senderId.toString() !== currentUserId.toString()) {
            return res.status(403).json({ msg: 'Not authorized to delete this message' });
        }

        message.isDeleted = true;
        await message.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const unreadCount = await Message.getUnreadCount(currentUserId);
        res.json({ unreadCount });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Helper function to check if users are connected
async function checkUserConnection(user1Id, user2Id, user1Role, user2Role) {
    try {
        // Implement your connection logic here
        // For now, allow all users to chat
        // In production, check your connection/relationship system
        
        // Example: Check if there's a connection request accepted between users
        // const connection = await Connection.findOne({
        //     $or: [
        //         { requester: user1Id, recipient: user2Id, status: 'accepted' },
        //         { requester: user2Id, recipient: user1Id, status: 'accepted' }
        //     ]
        // });
        
        // return !!connection;
        
        return true; // Allow all for now
    } catch (error) {
        console.error('Error checking connection:', error);
        return false;
    }
}
