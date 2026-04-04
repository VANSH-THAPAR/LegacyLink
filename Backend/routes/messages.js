const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');
const Student = require('../models/student');
const Alumni = require('../models/alumni');
const { 
    checkConnection, 
    checkConversationParticipant, 
    chatRateLimit, 
    validateMessage 
} = require('../middleware/connectionMiddleware');

// Conversation endpoints
router.get('/conversations', auth, chatController.getConversations);
router.post('/start-conversation', auth, checkConnection, chatController.startConversation);
router.get('/search-users', auth, chatController.searchUsers);

// Message endpoints
router.get('/conversation/:conversationId', auth, checkConversationParticipant, chatController.getMessages);
router.post('/send', auth, chatRateLimit, validateMessage, chatController.sendMessage);
router.post('/mark-read', auth, chatController.markAsRead);
router.delete('/:messageId', auth, chatController.deleteMessage);

// Utility endpoints
router.get('/unread-count', auth, chatController.getUnreadCount);

// Legacy endpoints (for backward compatibility)
router.get('/contacts', auth, chatController.getConversations);

// Debug endpoint to check users in database
router.get('/debug/users', async (req, res) => {
    try {
        const students = await Student.find().select('name rollNumber profilePicture').limit(5);
        const alumni = await Alumni.find().select('name rollNumber profilePicture company position').limit(5);
        
        res.json({
            studentsCount: await Student.countDocuments(),
            alumniCount: await Alumni.countDocuments(),
            sampleStudents: students,
            sampleAlumni: alumni
        });
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
