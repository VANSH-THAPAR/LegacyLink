import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    MoreVertical, 
    Paperclip, 
    Smile, 
    Search, 
    Phone, 
    Video, 
    Info, 
    Check, 
    CheckCheck,
    Circle,
    User,
    MessageCircle,
    Users
} from 'lucide-react';
import debounce from 'lodash/debounce';
import socketManager from '../utils/socket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatSystem = ({ user }) => {
    console.log('🔍 ChatSystem received user prop:', user);
    console.log('🔍 User object structure:', JSON.stringify(user, null, 2));
    
    // Ensure user object is properly accessed
    const userId = user?._id || user.id || user.userId;
    console.log('✅ Extracted user ID:', userId);
    
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        // Add current user to online users as fallback
        setOnlineUsers([{
            userId: user.id,
            name: user.name || user.profile?.name || 'You',
            role: user.role || user.profile?.role,
            joinedAt: new Date()
        }]);

        const socket = socketManager.connect(token, SOCKET_URL);
        socketRef.current = socket;

        // Set initial connection status immediately
        setConnectionStatus(socketManager.isConnected() ? 'connected' : 'disconnected');

        // Connection status
        const handleConnectionChange = (isConnected) => {
            setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        };

        socketManager.on('connectionChange', handleConnectionChange);

        // Define handlers for cleanup
        const handleOnlineUsers = (users) => {
            console.log('📥 Received online users update:', users.length, 'users');
            setOnlineUsers(users);
        };
        const handleOnlineUsersCount = (count) => {
            console.log('📥 Received online users count:', count);
        };
        const handleReceiveMessage = (message) => {
            if (selectedConversation && selectedConversation._id === message.conversationId) {
                setMessages(prev => {
                    // Prevent duplicates
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
                scrollToBottom();
            } else {
                // Update conversation list
                fetchConversations();
            }
        };
        const handleUserTyping = ({ user: typingUser, conversationId }) => {
            if (selectedConversation && selectedConversation._id === conversationId) {
                setTypingUsers(prev => new Set([...prev, typingUser.id]));
            }
        };
        const handleUserStoppedTyping = ({ user: typingUser, conversationId }) => {
            if (selectedConversation && selectedConversation._id === conversationId) {
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(typingUser.id);
                    return newSet;
                });
            }
        };
        const handleConversationUpdated = (update) => {
            setConversations(prev => prev.map(conv =>
                conv._id === update.conversationId
                    ? { ...conv, ...update }
                    : conv
            ));
        };
        const handleMessageRead = ({ messageId, userId }) => {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, readBy: [...msg.readBy, { userId, readAt: new Date() }] }
                    : msg
            ));
        };

        // Attach listeners
        socketManager.on('onlineUsers', handleOnlineUsers);
        socketManager.on('onlineUsersCount', handleOnlineUsersCount);
        socketManager.on('receiveMessage', handleReceiveMessage);
        socketManager.on('userTyping', handleUserTyping);
        socketManager.on('userStoppedTyping', handleUserStoppedTyping);
        socketManager.on('conversationUpdated', handleConversationUpdated);
        socketManager.on('messageRead', handleMessageRead);

        return () => {
            socketManager.off('connectionChange', handleConnectionChange);
            socketManager.off('onlineUsers', handleOnlineUsers);
            socketManager.off('onlineUsersCount', handleOnlineUsersCount);
            socketManager.off('receiveMessage', handleReceiveMessage);
            socketManager.off('userTyping', handleUserTyping);
            socketManager.off('userStoppedTyping', handleUserStoppedTyping);
            socketManager.off('conversationUpdated', handleConversationUpdated);
            socketManager.off('messageRead', handleMessageRead);
            // Don't disconnect on unmount as it's a singleton
        };
    }, [user, selectedConversation]);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('🔄 Fetching conversations with token:', token ? 'Token exists' : 'No token');
            
            const response = await fetch(`${API_URL}/messages/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('📥 Conversations response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📥 Conversations data received:', data);
                console.log('📝 Current conversations count:', data.conversations?.length || 0);
                console.log('📝 Setting conversations state:', data.conversations);
                setConversations(data.conversations || []);
            } else {
                const errorData = await response.json();
                console.error('❌ Conversations API error:', errorData);
                console.error('❌ Response text:', await response.text());
            }
        } catch (error) {
            console.error('💥 Error fetching conversations:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch messages for selected conversation
    const fetchMessages = useCallback(async (conversationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/conversation/${conversationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
                scrollToBottom();
                
                // Join conversation room
                socketManager.emit('joinConversation', conversationId);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, []);

    // Search users
    const searchUsers = useCallback(debounce(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        console.log('Searching for users with query:', query);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/search-users?query=${encodeURIComponent(query)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('Search response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Search results received:', data);
                setSearchResults(data);
            } else {
                const errorData = await response.json();
                console.error('Search API error:', errorData);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }, 300), []);

    // Start conversation with user
    const startConversation = async (targetUser) => {
        try {
            console.log('🚀 Starting conversation with user:', targetUser);
            
            const token = localStorage.getItem('token');
            console.log('🔑 Using token:', token ? 'Token exists' : 'No token');
            
            const requestBody = {
                userId: targetUser._id,
                userRole: targetUser.role
            };
            console.log('📤 Request body:', requestBody);
            
            const apiUrl = `${API_URL}/messages/start-conversation`;
            console.log('🌐 Making request to:', apiUrl);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📥 Start conversation response status:', response.status);

            if (response.ok) {
                const conversation = await response.json();
                console.log('✅ Conversation created successfully:', conversation);
                console.log('🔄 Updating UI state...');
                console.log('🔄 Setting selected conversation:', conversation);
                setSelectedConversation(conversation);
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults([]);
                console.log('🔄 Fetching conversations...');
                await fetchConversations();
                console.log('✅ UI state updated');
            } else {
                const errorData = await response.json();
                console.error('❌ Start conversation error:', errorData);
                console.error('❌ Response status:', response.status);
                console.error('❌ Response text:', await response.text());
            }
        } catch (error) {
            console.error('💥 Error starting conversation:', error);
        }
    };

    // Send message
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const messageContent = newMessage.trim();
        setNewMessage('');

        try {
            if (connectionStatus === 'connected' && socketManager.socket?.connected) {
                // Send via Socket.IO for real-time delivery
                socketManager.emit('sendMessage', {
                    conversationId: selectedConversation._id,
                    content: messageContent,
                    messageType: 'text'
                });
            } else {
                // Fallback to HTTP if Socket.IO is disconnected
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/messages/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        conversationId: selectedConversation._id,
                        content: messageContent,
                        messageType: 'text'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to send message');
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally show error to user
        }
    };

    // Handle typing indicator
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        if (!isTyping && selectedConversation) {
            setIsTyping(true);
            socketManager.emit('typing', {
                conversationId: selectedConversation._id
            });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            if (selectedConversation) {
                socketManager.emit('stopTyping', {
                    conversationId: selectedConversation._id
                });
            }
            setIsTyping(false);
        }, 3000);
    };

    // Mark message as read
    const markAsRead = (messageId) => {
        if (selectedConversation) {
            socketManager.emit('markAsRead', {
                messageId,
                conversationId: selectedConversation._id
            });
        }
    };

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Get other participant info
    const getOtherParticipant = (conversation) => {
        if (!conversation || !conversation.participants) return null;
        
        // Debug logging
        console.log('Conversation participants:', conversation.participants);
        console.log('Current user ID:', userId);
        console.log('Current user object keys:', Object.keys(user || {}));
        
        const otherParticipant = conversation.participants.find(p => {
            const participantId = p.userId?._id || p.userId;
            return participantId !== userId;
        });
        
        console.log('Other participant:', otherParticipant);
        return otherParticipant;
    };

    // Format message time
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format message date
    const formatMessageDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { 
                month: 'short', 
                day: 'numeric', 
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
            });
        }
    };

    // Check if user is online
    const isUserOnline = (userId) => {
        return onlineUsers.some(user => (user.userId || user._id) === userId);
    };

    // Effects
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        console.log('🎯 Selected conversation changed:', selectedConversation);
        if (selectedConversation) {
            console.log('📥 Fetching messages for conversation:', selectedConversation._id);
            fetchMessages(selectedConversation._id);
        }
    }, [selectedConversation, fetchMessages]);

    useEffect(() => {
        searchUsers(searchQuery);
    }, [searchQuery, searchUsers]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Get conversation display name
    const getConversationDisplayName = (conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        return otherParticipant?.userId?.name || 'Unknown User';
    };

    // Get unread count for conversation
    const getConversationUnreadCount = (conversation) => {
        const participant = conversation.participants.find(p => {
            const participantId = p.userId?._id || p.userId;
            return participantId === userId;
        });
        return participant?.unreadCount || 0;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3">
                    <Circle className="w-5 h-5 text-cyan-600 animate-pulse" />
                    <span className="text-slate-500">Loading conversations...</span>
                </div>
            </div>
        );
    }

    console.log('🚀 ChatSystem component rendering, user:', user);
    
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
            {/* Conversations List */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold text-slate-800">Messages</h3>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                                connectionStatus === 'connected' ? 'bg-green-500' : 
                                connectionStatus === 'error' ? 'bg-red-500' : 'bg-slate-300'
                            }`} />
                            <span className="text-xs text-slate-500">
                                {onlineUsers.length} online
                            </span>
                        </div>
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search conversations or start new..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSearch(true)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                        />
                        
                        {/* Search Results Dropdown */}
                        {showSearch && searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto"
                            >
                                {searchResults.map(result => (
                                    <button
                                        key={result._id}
                                        onClick={async () => {
                                            try {
                                                alert('🖱️ Click handler called! User: ' + result.name);
                                                console.log('🖱️ Clicked on search result:', result);
                                                console.log('🔍 Result details:', {
                                                    _id: result._id,
                                                    name: result.name,
                                                    role: result.role,
                                                    profilePicture: result.profilePicture
                                                });
                                                await startConversation(result);
                                            } catch (error) {
                                                console.error('💥 Error in click handler:', error);
                                                alert('Failed to start conversation. Please try again.');
                                            }
                                        }}
                                        className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="relative">
                                            <img 
                                                src={result.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                                                className="w-10 h-10 rounded-full" 
                                                alt={result.name}
                                            />
                                            {isUserOnline(result._id) && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800">{result.name}</p>
                                            <p className="text-xs text-slate-500 capitalize">{result.role}</p>
                                        </div>
                                        <MessageCircle className="w-4 h-4 text-cyan-600" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Conversations List */}
                <div className="p-2 overflow-y-auto flex-1">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No conversations yet</p>
                            <p className="text-sm mt-1">Search for users to start chatting</p>
                        </div>
                    ) : (
                        conversations.map(conversation => {
                            const otherParticipant = getOtherParticipant(conversation);
                            const unreadCount = getConversationUnreadCount(conversation);
                            
                            return (
                                <motion.button 
                                    key={conversation._id} 
                                    onClick={() => setSelectedConversation(conversation)} 
                                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors relative ${
                                        selectedConversation?._id === conversation._id ? 'bg-cyan-50' : 'hover:bg-slate-50'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img 
                                            src={otherParticipant?.userId?.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                                            className="w-12 h-12 rounded-full" 
                                            alt={otherParticipant?.userId?.name || 'User'}
                                        />
                                        {isUserOnline(otherParticipant?.userId?._id) && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    
                                    <div className="flex-grow overflow-hidden min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-slate-800 truncate">
                                                {otherParticipant?.userId?.name || 'Unknown User'}
                                            </p>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <p className="text-xs text-slate-400">
                                                    {formatMessageTime(conversation.lastMessageAt)}
                                                </p>
                                                {unreadCount > 0 && (
                                                    <span className="bg-cyan-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 truncate">
                                            {conversation.lastMessage}
                                        </p>
                                    </div>
                                </motion.button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="w-2/3 flex flex-col h-full bg-white relative overflow-hidden">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img 
                                        src={getOtherParticipant(selectedConversation)?.userId?.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                                        className="w-10 h-10 rounded-full" 
                                        alt={getConversationDisplayName(selectedConversation)}
                                    />
                                    {isUserOnline(getOtherParticipant(selectedConversation)?.userId?._id) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg truncate">
                                        {getConversationDisplayName(selectedConversation)}
                                    </h4>
                                    <p className="text-xs text-cyan-600 font-semibold">
                                        {isUserOnline(getOtherParticipant(selectedConversation)?.userId?._id) ? 'Active now' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-6 bg-slate-50/50 overflow-y-auto min-h-0">
                            {messages.length === 0 ? (
                                <div className="text-center text-slate-500 mt-8">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                    <p>No messages yet</p>
                                    <p className="text-sm mt-1">Start the conversation!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message, index) => {
                                        const currentMsgDate = new Date(message.createdAt).toDateString();
                                        const prevMsgDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
                                        const showDate = currentMsgDate !== prevMsgDate;

                                        const isOwn = String(message.senderId?._id || message.senderId) === String(userId);
                                        const isRead = message.readBy && message.readBy.length > 1;

                                        return (
                                            <React.Fragment key={message._id || index}>
                                                {showDate && (
                                                    <div className="flex justify-center my-4">
                                                        <div className="bg-slate-100 text-slate-500 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                                                            {formatMessageDate(message.createdAt)}
                                                        </div>
                                                    </div>
                                                )}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                        isOwn
                                                            ? 'bg-cyan-600 text-white shadow-md'
                                                            : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                                                    }`}>
                                                        <p className="break-words">{message.content}</p>

                                                        <div className={`flex items-center justify-end mt-1 gap-2 ${
                                                            isOwn ? 'text-cyan-100' : 'text-slate-400'
                                                        }`}>
                                                            <p className="text-[10px] uppercase font-semibold tracking-wider">
                                                                {formatMessageTime(message.createdAt)}
                                                            </p>
                                                            {isOwn && (
                                                                <div className="flex items-center">
                                                                    {isRead ? (
                                                                        <CheckCheck className="w-3.5 h-3.5 text-cyan-200" />
                                                                    ) : (
                                                                        <Check className="w-3.5 h-3.5 text-cyan-200" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* Typing Indicator */}
                                    {typingUsers.size > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-white text-slate-800 border border-slate-200 px-4 py-2 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                    </div>
                                                    <span className="text-sm text-slate-500">typing...</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200">
                            <div className="flex items-center gap-3">
                                <button type="button" className="p-3 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        value={newMessage}
                                        onChange={handleTyping}
                                        placeholder={`Message ${getConversationDisplayName(selectedConversation)}...`} 
                                        className="w-full bg-slate-100 border-transparent rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-12"
                                    />
                                    
                                    <button 
                                        type="button" 
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
                                    >
                                        <Smile className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {connectionStatus !== 'connected' && (
                                <p className="text-xs text-amber-500 mt-2 text-center">
                                    Connection lost. Sending message via fallback network...
                                </p>
                            )}
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <p>Select a conversation to start messaging</p>
                            <p className="text-sm mt-1">Or search for users to start a new conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ChatSystem;
