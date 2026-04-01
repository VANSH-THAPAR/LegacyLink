import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MoreVertical, Paperclip, Smile, Search } from 'lucide-react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_backend_url || 'http://localhost:5000/api';
// Assuming the socket server is at the same root as API but without /api
const SOCKET_URL = import.meta.env.VITE_backend_url ? import.meta.env.VITE_backend_url.replace('/api', '') : 'http://localhost:5000';

const MessagesPageWithBackend = ({ user }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); 
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    // Initialize Socket.io
    useEffect(() => {
        socketRef.current = io(SOCKET_URL);

        if (user && user._id) {
            socketRef.current.emit('join_room', user._id);
        }

        socketRef.current.on('receive_message', (message) => {
            // Only append message if it belongs to currently selected conversation
            // Check if message is from the selected user OR if I sent it (though send logic handles optimistic update usually)
            if (selectedUser && (message.sender._id === selectedUser._id || message.recipient === selectedUser._id)) {
                // Ensure unique messages (simple check)
                setMessages(prev => {
                    const exists = prev.some(m => m._id === message._id);
                    if (exists) return prev;
                    return [...prev, message];
                });
                setTimeout(scrollToBottom, 50);
            }
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [user, selectedUser]);

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/user/search?q=${searchQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setSearchQuery(''); // Clear search on select (optional)
        setSearchResults([]);
        // Check if user is already in conversations, if not (it's new), logic handles it fine as we load messages by ID
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/contacts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
                if (data.length > 0 && !selectedUser) {
                    setSelectedUser(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipientId: selectedUser._id,
                    content: newMessage
                })
            });

            if (response.ok) {
                const sentMessage = await response.json();
                setMessages(prev => [...prev, sentMessage]); 
                setNewMessage('');
                scrollToBottom();
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
            className="flex h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
            {/* Conversations List */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Messages</h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search students or alumni..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {searchQuery ? (
                         searchResults.length === 0 ? (
                             <div className="p-8 text-center text-slate-500 text-sm">No users found</div>
                         ) : (
                             searchResults.map(contact => (
                                 <motion.button 
                                     key={contact._id} 
                                     onClick={() => handleUserSelect(contact)} 
                                     className="w-full text-left p-3 mb-2 rounded-xl flex items-center gap-3 transition-all hover:bg-white hover:shadow-sm"
                                     whileHover={{ scale: 1.01 }}
                                 >
                                     <div className="relative">
                                         <img 
                                             src={contact.profilePicture || 'https://via.placeholder.com/40'} 
                                             className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" 
                                             alt={contact.name}
                                         />
                                     </div>
                                     <div className="flex-grow min-w-0">
                                         <div className="flex justify-between items-baseline">
                                             <p className="font-semibold text-slate-800 truncate">
                                                 {contact.name}
                                             </p>
                                             <span className="text-xs text-slate-400 capitalize">{contact.role}</span>
                                         </div>
                                         <p className="text-xs text-slate-500 truncate mt-0.5">
                                             {contact.collegeName}
                                         </p>
                                     </div>
                                 </motion.button>
                             ))
                         )
                    ) : ( 
                        conversations.length === 0 ? (
                            <div className="p-4 text-center text-slate-500">
                                No conversations yet
                            </div>
                        ) : (
                            conversations.map(contact => (
                                <motion.button 
                                    key={contact._id} 
                                    onClick={() => setSelectedUser(contact)} 
                                    className={`w-full text-left p-3 mb-2 rounded-xl flex items-center gap-3 transition-all ${
                                        selectedUser?._id === contact._id 
                                            ? 'bg-white shadow-md border-l-4 border-cyan-500' 
                                            : 'hover:bg-white hover:shadow-sm'
                                    }`}
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <div className="relative">
                                        <img 
                                            src={contact.profilePicture || 'https://via.placeholder.com/40'} 
                                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" 
                                            alt={contact.name}
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-slate-800 truncate">
                                                {contact.name}
                                            </p>
                                            <span className="text-xs text-slate-400 capitalize">{contact.role}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            Click to view chat
                                        </p>
                                </div>
                            </motion.button>
                        ))
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-white">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={selectedUser.profilePicture || 'https://via.placeholder.com/40'} 
                                    className="w-10 h-10 rounded-full object-cover" 
                                    alt={selectedUser.name}
                                />
                                <div>
                                    <h3 className="font-bold text-slate-800">{selectedUser.name}</h3>
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Available
                                    </p>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg, index) => {
                                // Determine if isOwn message. 
                                // user prop should be passed from parent
                                const isOwn = msg.sender._id === user?._id || msg.sender === user?._id;
                                
                                return (
                                    <motion.div 
                                        key={msg._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                                            isOwn 
                                                ? 'bg-blue-600 text-white rounded-br-none' 
                                                : 'bg-white text-slate-800 rounded-bl-none'
                                        }`}>
                                            {!isOwn && (
                                                <p className="text-xs font-bold mb-1 opacity-70">
                                                    {msg.sender.name || selectedUser.name}
                                                </p>
                                            )}
                                            <p className="text-sm">{msg.content}</p>
                                            <div className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <form onSubmit={sendMessage} className="flex gap-2 items-end">
                                <button type="button" className="p-3 text-slate-400 hover:text-blue-500 rounded-full hover:bg-slate-50 transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <div className="flex-grow relative">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="w-full bg-slate-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 resize-none max-h-32 min-h-[50px]"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage(e);
                                            }
                                        }}
                                    />
                                    <button type="button" className="absolute right-3 bottom-3 text-slate-400 hover:text-blue-500">
                                        <Smile size={20} />
                                    </button>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                            <Send size={32} className="text-slate-400 ml-1" />
                        </div>
                        <p className="text-lg font-medium text-slate-500">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MessagesPageWithBackend;
