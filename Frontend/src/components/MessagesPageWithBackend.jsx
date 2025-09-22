import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MoreVertical, Paperclip, Smile } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MessagesPageWithBackend = ({ user }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
                if (data.length > 0) {
                    setSelectedConversation(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/conversation/${conversationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId: selectedConversation.id,
                    content: newMessage
                })
            });

            if (response.ok) {
                const sentMessage = await response.json();
                setMessages(prev => [...prev, sentMessage]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading conversations...</div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-200 shadow-sm"
        >
            {/* Conversations List */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">Messages</h3>
                </div>
                <div className="p-2 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">
                            No conversations yet
                        </div>
                    ) : (
                        conversations.map(conversation => (
                            <motion.button 
                                key={conversation.id} 
                                onClick={() => setSelectedConversation(conversation)} 
                                className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-colors ${
                                    selectedConversation?.id === conversation.id ? 'bg-cyan-50' : 'hover:bg-slate-50'
                                }`}
                                whileHover={{ scale: 1.02 }}
                            >
                                <img 
                                    src={conversation.otherUser.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face'} 
                                    className="w-12 h-12 rounded-full flex-shrink-0" 
                                    alt={conversation.otherUser.name}
                                />
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-slate-800 truncate">
                                            {conversation.otherUser.name}
                                        </p>
                                        <p className="text-xs text-slate-400 flex-shrink-0">
                                            {conversation.lastMessageTime}
                                        </p>
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">
                                        {conversation.lastMessage}
                                    </p>
                                </div>
                            </motion.button>
                        ))
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="w-2/3 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={selectedConversation.otherUser.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                                    className="w-10 h-10 rounded-full" 
                                    alt={selectedConversation.otherUser.name}
                                />
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg truncate">
                                        {selectedConversation.otherUser.name}
                                    </h4>
                                    <p className="text-xs text-cyan-600 font-semibold">
                                        {selectedConversation.otherUser.role === 'student' ? 'Student' : 'Alumni'}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                                <MoreVertical />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow p-6 bg-slate-50/50 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="text-center text-slate-500 mt-8">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message, index) => (
                                        <div 
                                            key={index}
                                            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                message.senderId === user.id 
                                                    ? 'bg-cyan-600 text-white' 
                                                    : 'bg-white text-slate-800 border border-slate-200'
                                            }`}>
                                                <p className="break-words">{message.content}</p>
                                                <p className={`text-xs mt-1 ${
                                                    message.senderId === user.id ? 'text-cyan-100' : 'text-slate-400'
                                                }`}>
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
                            <button type="button" className="p-3 text-slate-500 hover:bg-slate-100 rounded-full">
                                <Paperclip/>
                            </button>
                            <button type="button" className="p-3 text-slate-500 hover:bg-slate-100 rounded-full">
                                <Smile/>
                            </button>
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={`Message ${selectedConversation.otherUser.name}...`} 
                                className="w-full bg-slate-100 border-transparent rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send/>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MessagesPageWithBackend;
