const Message = require('../models/Message');
const { User } = require('../models/UnifiedUser');

// Get conversation with a specific user
exports.getConversation = async (req, res) => {
    try {
        const { userId } = req.params; // The other person
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId }
            ]
        })
        .sort({ createdAt: 1 }) // Oldest first
        .populate('sender', 'name profilePicture')
        .populate('recipient', 'name profilePicture');

        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user.id;

        if (!content || !recipientId) {
            return res.status(400).json({ msg: 'Content and recipient are required' });
        }

        const newMessage = new Message({
            sender: senderId,
            recipient: recipientId,
            content
        });

        await newMessage.save();

        const populatedMessage = await newMessage.populate('sender', 'name profilePicture');

        // Real-time Socket.io emission
        const io = req.app.get('io');
        if (io) {
            // Emit to recipient's room
            io.to(recipientId).emit('receive_message', populatedMessage);
        }

        res.json(populatedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Get list of users the current user has chatted with
exports.getContacts = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        // Find distinct users interacting with current user
        // This is a simplified approach. For high scale, maintain a separate "Conversation" collection.
        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { recipient: currentUserId }]
        }).populate('sender recipient', 'name profilePicture role');

        const contactsMap = new Map();

        messages.forEach(msg => {
            const output = msg.sender._id.toString() === currentUserId ? msg.recipient : msg.sender;
            if (!contactsMap.has(output._id.toString())) {
                contactsMap.set(output._id.toString(), output);
            }
        });

        res.json(Array.from(contactsMap.values()));
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};
