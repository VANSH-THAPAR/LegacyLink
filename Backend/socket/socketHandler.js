const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Student = require('../models/student');
const Alumni = require('../models/alumni');

class SocketHandler {
    constructor(io) {
        this.io = io;
        this.onlineUsers = new Map(); // userId -> { socketId, role, joinedAt }
        this.typingUsers = new Map(); // conversationId -> Set of userIds
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    setupMiddleware() {
        // Authentication middleware for Socket.IO
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // The decoded token has structure: { user: { id, role, email } }
                const userPayload = decoded.user;
                if (!userPayload) {
                    return next(new Error('Invalid token structure'));
                }

                let user;

                // Find user based on role
                if (userPayload.role === 'student') {
                    user = await Student.findOne({ authId: userPayload.id }).select('name profilePicture rollNumber');
                } else if (userPayload.role === 'alumni') {
                    user = await Alumni.findOne({ authId: userPayload.id }).select('name profilePicture rollNumber');
                }

                if (!user) {
                    return next(new Error('User not found'));
                }

                socket.user = {
                    id: user._id,
                    role: userPayload.role,
                    name: user.name,
                    profilePicture: user.profilePicture,
                    rollNumber: user.rollNumber
                };

                next();
            } catch (error) {
                console.error('Socket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`✅ User connected: ${socket.user.name} (${socket.user.id}) - ${socket.user.role}`);
            console.log(`📊 Total online users before: ${this.onlineUsers.size}`);
            
            // Add to online users
            this.onlineUsers.set(socket.user.id.toString(), {
                socketId: socket.id,
                role: socket.user.role,
                name: socket.user.name,
                joinedAt: new Date()
            });

            console.log(`📊 Total online users after: ${this.onlineUsers.size}`);
            console.log(`👥 Current online users:`, Array.from(this.onlineUsers.keys()));

            // Join personal room
            socket.join(socket.user.id.toString());

            // Broadcast online status to all clients
            this.broadcastOnlineUsers();
            
            // Send current online count to the newly connected user
            socket.emit('onlineUsersCount', this.onlineUsers.size);

            // Join conversation room
            socket.on('joinConversation', async (conversationId) => {
                try {
                    const conversation = await Conversation.findById(conversationId);
                    if (!conversation) {
                        socket.emit('error', { message: 'Conversation not found' });
                        return;
                    }

                    // Check if user is participant
                    const isParticipant = conversation.participants.some(
                        p => p.userId.toString() === socket.user.id.toString()
                    );

                    if (!isParticipant) {
                        socket.emit('error', { message: 'Not authorized to join this conversation' });
                        return;
                    }

                    socket.join(conversationId);
                    console.log(`User ${socket.user.name} joined conversation ${conversationId}`);

                    // Mark messages as read
                    await this.markConversationAsRead(conversationId, socket.user.id);

                    // Notify other participants
                    socket.to(conversationId).emit('userJoinedConversation', {
                        conversationId,
                        user: socket.user
                    });

                } catch (error) {
                    console.error('Error joining conversation:', error);
                    socket.emit('error', { message: 'Failed to join conversation' });
                }
            });

            // Leave conversation room
            socket.on('leaveConversation', (conversationId) => {
                socket.leave(conversationId);
                console.log(`User ${socket.user.name} left conversation ${conversationId}`);
            });

            // Send message
            socket.on('sendMessage', async (data) => {
                try {
                    const { conversationId, content, messageType = 'text' } = data;

                    if (!conversationId || !content) {
                        socket.emit('error', { message: 'Conversation ID and content are required' });
                        return;
                    }

                    // Validate conversation and participation
                    const conversation = await Conversation.findById(conversationId);
                    if (!conversation) {
                        socket.emit('error', { message: 'Conversation not found' });
                        return;
                    }

                    const isParticipant = conversation.participants.some(
                        p => p.userId.toString() === socket.user.id.toString()
                    );

                    if (!isParticipant) {
                        socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
                        return;
                    }

                    // Create message
                    const message = new Message({
                        conversationId,
                        senderId: socket.user.id,
                        senderRole: socket.user.role,
                        content: content.trim(),
                        messageType
                    });

                    // Add sender to readBy array
                    message.readBy.push({
                        userId: socket.user.id,
                        readAt: new Date()
                    });

                    await message.save();

                    // Update conversation
                    conversation.lastMessage = content.length > 100 ? content.substring(0, 100) + '...' : content;
                    conversation.lastMessageAt = new Date();
                    conversation.lastMessageBy = socket.user.id;
                    conversation.metadata.totalMessages += 1;
                    conversation.metadata.lastActivity = new Date();

                    // Update unread count for other participants
                    for (const participant of conversation.participants) {
                        if (participant.userId.toString() !== socket.user.id.toString()) {
                            participant.unreadCount += 1;
                        }
                    }

                    await conversation.save();

                    // Populate message details
                    await message.populate('senderId', 'name profilePicture');

                    // Broadcast to all participants
                    const messageData = {
                        _id: message._id,
                        conversationId: message.conversationId,
                        senderId: message.senderId,
                        senderRole: message.senderRole,
                        content: message.content,
                        messageType: message.messageType,
                        readBy: message.readBy,
                        createdAt: message.createdAt,
                        sender: message.senderId
                    };

                    this.io.to(conversationId).emit('receiveMessage', messageData);

                    // Update conversation list for all participants
                    for (const participant of conversation.participants) {
                        this.io.to(participant.userId.toString()).emit('conversationUpdated', {
                            conversationId,
                            lastMessage: conversation.lastMessage,
                            lastMessageAt: conversation.lastMessageAt,
                            unreadCount: participant.unreadCount
                        });
                    }

                    console.log(`Message sent in conversation ${conversationId} by ${socket.user.name}`);

                } catch (error) {
                    console.error('Error sending message:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            // Typing indicator
            socket.on('typing', ({ conversationId }) => {
                if (!conversationId) return;

                if (!this.typingUsers.has(conversationId)) {
                    this.typingUsers.set(conversationId, new Set());
                }

                this.typingUsers.get(conversationId).add(socket.user.id);

                socket.to(conversationId).emit('userTyping', {
                    conversationId,
                    user: socket.user
                });

                // Auto-remove typing indicator after 3 seconds
                setTimeout(() => {
                    if (this.typingUsers.has(conversationId)) {
                        this.typingUsers.get(conversationId).delete(socket.user.id);
                        socket.to(conversationId).emit('userStoppedTyping', {
                            conversationId,
                            user: socket.user
                        });
                    }
                }, 3000);
            });

            socket.on('stopTyping', ({ conversationId }) => {
                if (!conversationId) return;

                if (this.typingUsers.has(conversationId)) {
                    this.typingUsers.get(conversationId).delete(socket.user.id);
                    socket.to(conversationId).emit('userStoppedTyping', {
                        conversationId,
                        user: socket.user
                    });
                }
            });

            // Mark message as read
            socket.on('markAsRead', async ({ messageId, conversationId }) => {
                try {
                    if (!messageId || !conversationId) return;

                    const message = await Message.findById(messageId);
                    if (!message) return;

                    // Check if user is participant
                    const conversation = await Conversation.findById(conversationId);
                    const isParticipant = conversation.participants.some(
                        p => p.userId.toString() === socket.user.id.toString()
                    );

                    if (!isParticipant) return;

                    // Add user to readBy if not already there
                    const alreadyRead = message.readBy.some(
                        read => read.userId.toString() === socket.user.id.toString()
                    );

                    if (!alreadyRead) {
                        message.readBy.push({
                            userId: socket.user.id,
                            readAt: new Date()
                        });
                        await message.save();

                        // Update conversation unread count
                        await conversation.markAsRead(socket.user.id);

                        // Notify other participants
                        socket.to(conversationId).emit('messageRead', {
                            messageId,
                            userId: socket.user.id,
                            readAt: new Date()
                        });
                    }

                } catch (error) {
                    console.error('Error marking message as read:', error);
                }
            });

            // Handle disconnect
            socket.on('disconnect', (reason) => {
                console.log(`❌ User disconnected: ${socket.user.name} (${socket.user.id}) - Reason: ${reason}`);
                console.log(`📊 Total online users before disconnect: ${this.onlineUsers.size}`);
                
                // Remove from online users
                this.onlineUsers.delete(socket.user.id.toString());

                console.log(`📊 Total online users after disconnect: ${this.onlineUsers.size}`);
                console.log(`👥 Remaining online users:`, Array.from(this.onlineUsers.keys()));

                // Remove from typing indicators
                for (const [conversationId, users] of this.typingUsers.entries()) {
                    users.delete(socket.user.id);
                }

                // Broadcast offline status to all remaining clients
                this.broadcastOnlineUsers();
            });
        });
    }

    async markConversationAsRead(conversationId, userId) {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (conversation) {
                await conversation.markAsRead(userId);

                // Mark all unread messages as read
                await Message.updateMany(
                    {
                        conversationId,
                        senderId: { $ne: userId },
                        'readBy.userId': { $ne: userId }
                    },
                    {
                        $push: {
                            readBy: {
                                userId: userId,
                                readAt: new Date()
                            }
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Error marking conversation as read:', error);
        }
    }

    broadcastOnlineUsers() {
        const onlineUsersList = Array.from(this.onlineUsers.entries()).map(([userId, data]) => ({
            userId,
            name: data.name,
            role: data.role,
            joinedAt: data.joinedAt
        }));

        console.log(`📡 Broadcasting online users list:`, onlineUsersList.length, 'users');
        this.io.emit('onlineUsers', onlineUsersList);
        this.io.emit('onlineUsersCount', onlineUsersList.length);
    }

    // Helper method to check if two users are connected
    async checkConnection(user1Id, user2Id) {
        try {
            // This would check your connection/relationship system
            // For now, we'll allow all users to chat
            // In production, implement your connection logic here
            return true;
        } catch (error) {
            console.error('Error checking connection:', error);
            return false;
        }
    }

    // Get online users count
    getOnlineUsersCount() {
        return this.onlineUsers.size;
    }

    // Get typing users in conversation
    getTypingUsers(conversationId) {
        return this.typingUsers.get(conversationId) || new Set();
    }
}

module.exports = SocketHandler;
