const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { Student, Alumni, University } = require('../models/User');

// Mock conversation data - in production, this would be a separate Message/Conversation model
const mockConversations = {
    1: [
        { id: 1, senderId: 2, receiverId: 1, text: "Hey Ananya, thanks for reaching out!", timestamp: new Date('2025-09-22T10:30:00'), sender: 'them' },
        { id: 2, senderId: 1, receiverId: 2, text: "Thank you so much, Rohan!", timestamp: new Date('2025-09-22T10:32:00'), sender: 'me' },
        { id: 3, senderId: 2, receiverId: 1, text: "Great! I'll send over some notes by tomorrow.", timestamp: new Date('2025-09-22T10:35:00'), sender: 'them' }
    ],
    2: [
        { id: 4, senderId: 3, receiverId: 1, text: "Hi Ananya, let's chat about UX design!", timestamp: new Date('2025-09-21T15:20:00'), sender: 'them' }
    ]
};

// [GET] /api/messages/conversations - Get user's conversations
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // In a real app, you'd query the database for conversations involving this user
        // For now, return mock data
        const conversations = [];
        
        for (const [conversationId, messages] of Object.entries(mockConversations)) {
            const lastMessage = messages[messages.length - 1];
            const otherUserId = lastMessage.senderId === userId ? lastMessage.receiverId : lastMessage.senderId;
            
            // Get the other user's info
            const otherUser = await User.findById(otherUserId).select('name profilePicture role position company');
            
            if (otherUser) {
                conversations.push({
                    id: conversationId,
                    otherUser,
                    lastMessage: {
                        text: lastMessage.text,
                        timestamp: lastMessage.timestamp,
                        unread: Math.random() > 0.5 // Mock unread status
                    },
                    messageCount: messages.length
                });
            }
        }
        
        res.json(conversations);
    } catch (err) {
        console.error('Get conversations error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [GET] /api/messages/conversation/:id - Get messages in a specific conversation
router.get('/conversation/:id', authMiddleware, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const messages = mockConversations[conversationId] || [];
        
        res.json(messages);
    } catch (err) {
        console.error('Get conversation messages error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [POST] /api/messages/send - Send a message
router.post('/send', authMiddleware, async (req, res) => {
    try {
        const { receiverId, text, conversationId } = req.body;
        
        if (!receiverId || !text) {
            return res.status(400).json({ msg: 'Receiver ID and message text are required' });
        }
        
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ msg: 'Receiver not found' });
        }
        
        const newMessage = {
            id: Date.now(), // Simple ID generation
            senderId: req.user.id,
            receiverId: parseInt(receiverId),
            text,
            timestamp: new Date(),
            sender: 'me'
        };
        
        // Add to mock conversation
        const convId = conversationId || receiverId;
        if (!mockConversations[convId]) {
            mockConversations[convId] = [];
        }
        mockConversations[convId].push(newMessage);
        
        res.json({
            msg: 'Message sent successfully',
            message: newMessage
        });
    } catch (err) {
        console.error('Send message error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [POST] /api/messages/start-conversation - Start a new conversation
router.post('/start-conversation', authMiddleware, async (req, res) => {
    try {
        const { receiverId, initialMessage } = req.body;
        
        if (!receiverId || !initialMessage) {
            return res.status(400).json({ msg: 'Receiver ID and initial message are required' });
        }
        
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ msg: 'Receiver not found' });
        }
        
        const conversationId = `${Math.min(req.user.id, receiverId)}_${Math.max(req.user.id, receiverId)}`;
        
        const newMessage = {
            id: Date.now(),
            senderId: req.user.id,
            receiverId: parseInt(receiverId),
            text: initialMessage,
            timestamp: new Date(),
            sender: 'me'
        };
        
        mockConversations[conversationId] = [newMessage];
        
        res.json({
            msg: 'Conversation started successfully',
            conversationId,
            message: newMessage
        });
    } catch (err) {
        console.error('Start conversation error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
