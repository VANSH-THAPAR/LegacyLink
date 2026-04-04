const Conversation = require('../models/Conversation');
const Student = require('../models/student');
const Alumni = require('../models/alumni');

/**
 * Middleware to check if two users are connected and can chat
 * This implements the connection validation logic for the chat system
 */
const checkConnection = async (req, res, next) => {
    try {
        const { userId, userRole } = req.body;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        // If no target user specified, proceed (for endpoints that don't need it)
        if (!userId || !userRole) {
            return next();
        }

        // Check if users are connected
        const isConnected = await areUsersConnected(currentUserId, userId, currentUserRole, userRole);
        
        if (!isConnected) {
            return res.status(403).json({ 
                msg: 'You can only chat with users you are connected with',
                code: 'CONNECTION_REQUIRED'
            });
        }

        // Attach connection info to request for later use
        req.connectionInfo = {
            isConnected: true,
            targetUserId: userId,
            targetUserRole: userRole
        };

        next();
    } catch (error) {
        console.error('Connection middleware error:', error);
        res.status(500).json({ msg: 'Server error checking connection' });
    }
};

/**
 * Middleware to check if user is participant in a conversation
 */
const checkConversationParticipant = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const currentUserId = req.user.id;

        if (!conversationId) {
            return res.status(400).json({ msg: 'Conversation ID is required' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }

        const isParticipant = conversation.participants.some(
            p => p.userId.toString() === currentUserId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({ 
                msg: 'Not authorized to access this conversation',
                code: 'NOT_PARTICIPANT'
            });
        }

        // Attach conversation to request for later use
        req.conversation = conversation;
        next();
    } catch (error) {
        console.error('Conversation participant middleware error:', error);
        res.status(500).json({ msg: 'Server error checking conversation' });
    }
};

/**
 * Check if two users are connected based on your platform's connection logic
 * This is a placeholder - implement your actual connection logic here
 */
async function areUsersConnected(user1Id, user2Id, user1Role, user2Role) {
    try {
        // IMPLEMENT YOUR CONNECTION LOGIC HERE
        // Examples of connection criteria:
        // 1. Same university/college
        // 2. Accepted connection requests
        // 3. Same department/batch
        // 4. Mentor-mentee relationships
        // 5. Event participants
        // 6. Shared interests/skills

        // For now, allow all verified users to chat with each other
        // In production, replace this with your actual connection logic

        // Example implementation options:
        
        let u1, u2;
        if (user1Role === 'student') {
            u1 = await Student.findOne({ authId: user1Id });
        } else {
            u1 = await Alumni.findOne({ authId: user1Id });
        }

        if (user2Role === 'student') {
            u2 = await Student.findOne({ authId: user2Id });
        } else {
            u2 = await Alumni.findOne({ authId: user2Id });
        }

        if (!u1 || !u2) return false;

        // Alumni to Alumni connection
        if (user1Role === 'alumni' && user2Role === 'alumni') {
            // Check if they are in each other's connections array
            if (u1.connections && (u1.connections.includes(u2._id) || u2.connections.includes(u1._id))) {
                return true;
            }
        } 
        // Alumni and Student connection
        else if (user1Role === 'alumni' && user2Role === 'student') {
            if (u1.followers && u1.followers.includes(u2._id)) {
                return true;
            }
        } 
        // Student and Alumni connection
        else if (user1Role === 'student' && user2Role === 'alumni') {
            if (u2.followers && u2.followers.includes(u1._id)) {
                return true;
            }
        }

        // Option 3: Check if users are in same events
        return false;

    } catch (error) {
        console.error('Error checking user connection:', error);
        return false;
    }
}

/**
 * Rate limiting middleware for chat messages
 */
const chatRateLimit = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const now = Date.now();
        const windowMs = 60000; // 1 minute window
        const maxMessages = 30; // Max 30 messages per minute

        // This would use Redis in production for distributed rate limiting
        // For now, we'll use a simple in-memory approach
        const rateLimitKey = `chat_rate_${currentUserId}`;
        
        // In production, use Redis or similar:
        // const redis = require('../utils/redis');
        // const messageCount = await redis.incr(rateLimitKey);
        // if (messageCount === 1) {
        //     await redis.expire(rateLimitKey, 60);
        // }
        // if (messageCount > maxMessages) {
        //     return res.status(429).json({ msg: 'Too many messages, please wait' });
        // }

        // Skip rate limiting for now (implement in production)
        next();
    } catch (error) {
        console.error('Rate limiting error:', error);
        next(); // Allow request on error
    }
};

/**
 * Validate message content
 */
const validateMessage = (req, res, next) => {
    try {
        const { content, messageType = 'text' } = req.body;

        if (!content || typeof content !== 'string') {
            return res.status(400).json({ msg: 'Message content is required' });
        }

        if (content.trim().length === 0) {
            return res.status(400).json({ msg: 'Message content cannot be empty' });
        }

        if (content.length > 2000) {
            return res.status(400).json({ msg: 'Message content too long (max 2000 characters)' });
        }

        // Validate message type
        const validTypes = ['text', 'image', 'file', 'system'];
        if (!validTypes.includes(messageType)) {
            return res.status(400).json({ msg: 'Invalid message type' });
        }

        // Check for inappropriate content (implement your content moderation)
        if (containsInappropriateContent(content)) {
            return res.status(400).json({ msg: 'Message contains inappropriate content' });
        }

        next();
    } catch (error) {
        console.error('Message validation error:', error);
        res.status(500).json({ msg: 'Server error validating message' });
    }
};

/**
 * Simple content moderation (implement your own logic)
 */
function containsInappropriateContent(content) {
    // Implement your content moderation logic here
    // Examples:
    // - Check for profanity
    // - Check for spam patterns
    // - Check for inappropriate links
    // - Check for harassment
    
    const inappropriateWords = []; // Add your banned words
    
    const lowerContent = content.toLowerCase();
    return inappropriateWords.some(word => lowerContent.includes(word));
}

module.exports = {
    checkConnection,
    checkConversationParticipant,
    chatRateLimit,
    validateMessage,
    areUsersConnected
};
