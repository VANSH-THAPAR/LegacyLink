import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Building, Users, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NetworkPageWithBackend = ({ user, setActivePage }) => {
    const [alumni, setAlumni] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        industry: '',
        location: '',
        skills: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState({ connectionRequests: [], followerRequests: [] });
    const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'requests', 'connections'
    const [myConnections, setMyConnections] = useState([]);

    useEffect(() => {
        if (activeTab === 'discover') {
            fetchAlumni();
        } else if (activeTab === 'requests') {
            fetchPendingRequests();
        } else if (activeTab === 'connections') {
            fetchMyConnections();
        }
    }, [searchQuery, filters, activeTab]);

    const fetchPendingRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/alumni/pending-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPendingRequests(data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const fetchMyConnections = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/alumni/my-connections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMyConnections(data.connections);
            }
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    };

    const handleAcceptRequest = async (requesterId, type) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/alumni/connect/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requesterId, type })
            });

            if (response.ok) {
                if (type === 'alumni') {
                    setPendingRequests(prev => ({
                        ...prev,
                        connectionRequests: prev.connectionRequests.filter(req => req._id !== requesterId)
                    }));
                } else {
                    setPendingRequests(prev => ({
                        ...prev,
                        followerRequests: prev.followerRequests.filter(req => req._id !== requesterId)
                    }));
                }
            }
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleRejectRequest = async (requesterId, type) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/alumni/connect/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requesterId, type })
            });

            if (response.ok) {
                if (type === 'alumni') {
                    setPendingRequests(prev => ({
                        ...prev,
                        connectionRequests: prev.connectionRequests.filter(req => req._id !== requesterId)
                    }));
                } else {
                    setPendingRequests(prev => ({
                        ...prev,
                        followerRequests: prev.followerRequests.filter(req => req._id !== requesterId)
                    }));
                }
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    const fetchAlumni = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            
            if (searchQuery) params.append('q', searchQuery);
            if (filters.industry) params.append('industry', filters.industry);
            if (filters.location) params.append('location', filters.location);
            if (filters.skills) params.append('skills', filters.skills);

            const response = await fetch(`${API_URL}/alumni/search?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setAlumni(data);
            }
        } catch (error) {
            console.error('Error fetching alumni:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async (alumniId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/alumni/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ alumniId })
            });

            if (response.ok) {
                // Update UI to show connection sent
                setAlumni(prev => prev.map(a => 
                    a._id === alumniId ? { ...a, connectionSent: true } : a
                ));
            }
        } catch (error) {
            console.error('Error sending connection request:', error);
        }
    };

    const startConversation = async (userId, role) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/start-conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, userRole: role || 'alumni' })
            });

            if (response.ok) {
                if (setActivePage) {
                    setActivePage('Messages');
                } else {
                    alert('Conversation started! Check your messages.');
                }
            } else {
                const data = await response.json();
                alert(data.msg || 'Cannot start conversation');
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Alumni Network</h2>
                    <p className="text-slate-500 mt-1">Connect with fellow alumni and expand your professional circle.</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setActiveTab('discover')}
                        className={`px-4 py-2 font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === 'discover' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Find Alumni
                    </button>
                    <button
                        onClick={() => setActiveTab('connections')}
                        className={`px-4 py-2 font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === 'connections' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        My Connections ({myConnections.length || 0})
                    </button>
                    {user?.role === 'alumni' && (
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-2 font-medium rounded-lg whitespace-nowrap transition-colors relative ${activeTab === 'requests' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            Requests
                                {(pendingRequests?.connectionRequests?.length > 0 || pendingRequests?.followerRequests?.length > 0) && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                                        {(pendingRequests?.connectionRequests?.length || 0) + (pendingRequests?.followerRequests?.length || 0)}
                                    </span>
                                )}
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'discover' && (
                <>
                    {/* Search and Filters */}
                    <div className="mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search alumni..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <select
                        value={filters.industry}
                        onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full py-3 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">All Industries</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Consulting">Consulting</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Location"
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full py-3 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                        type="text"
                        placeholder="Skills"
                        value={filters.skills}
                        onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                        className="w-full py-3 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
            </div>

            {/* Alumni Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-500">Loading alumni...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {alumni.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No alumni found matching your criteria.
                        </div>
                    ) : (
                        alumni.map((alumnus, i) => (
                            <motion.div 
                                key={alumnus._id} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="bg-white p-6 rounded-2xl h-full border border-slate-200 text-center flex flex-col items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                <img 
                                    src={alumnus.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face'} 
                                    alt={alumnus.name} 
                                    className="w-24 h-24 rounded-full ring-4 ring-slate-100 object-cover" 
                                />
                                <h4 className="mt-4 text-lg font-bold text-slate-800 truncate w-full">
                                    {alumnus.name}
                                </h4>
                                <p className="text-sm text-cyan-600 font-medium truncate w-full">
                                    {alumnus.position || 'Alumni'}
                                </p>
                                <p className="text-sm text-slate-500 truncate w-full">
                                    {alumnus.company || 'Company not specified'}
                                </p>
                                
                                {alumnus.location && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin size={12}/> {alumnus.location}
                                    </div>
                                )}

                                {alumnus.industry && (
                                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                        <Building size={12}/> {alumnus.industry}
                                    </div>
                                )}

                                {alumnus.skills && alumnus.skills.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1 justify-center">
                                        {alumnus.skills.slice(0, 3).map(skill => (
                                            <span key={skill} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                        {alumnus.skills.length > 3 && (
                                            <span className="text-xs text-slate-400">+{alumnus.skills.length - 3} more</span>
                                        )}
                                    </div>
                                )}

                                <div className="mt-auto pt-4 flex gap-3 w-full">
                                    <button 
                                        onClick={() => handleConnect(alumnus._id)}
                                        disabled={alumnus.connectionSent}
                                        className={`flex-1 font-semibold px-4 py-2 rounded-full text-sm transition-transform hover:scale-105 ${
                                            alumnus.connectionSent 
                                                ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                                                : 'bg-cyan-600 text-white hover:bg-cyan-700'
                                        }`}
                                    >
                                        <Users size={14} className="inline mr-1"/>
                                        {alumnus.connectionSent ? 'Sent' : (user?.role === 'student' ? 'Follow' : 'Connect')}
                                    </button>
                                    <button 
                                          onClick={() => startConversation(alumnus.authId, alumnus.role || 'alumni')}
                                        className="flex-1 bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-full text-sm hover:bg-slate-200 transition-transform hover:scale-105"
                                    >
                                        <MessageSquare size={14} className="inline mr-1"/>
                                        Message
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
            </>
            )}

            {activeTab === 'requests' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Connection Requests (Alumni)</h3>
                        {pendingRequests?.connectionRequests?.length === 0 ? (
                            <p className="text-slate-500 py-4">No pending connection requests.</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests?.connectionRequests?.map(req => (
                                    <div key={req._id} className="bg-white p-4 justify-between items-center rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <img src={req.profilePicture || 'https://placehold.co/100'} alt={req.name} className="w-12 h-12 rounded-full object-cover"/>
                                            <div>
                                                <p className="font-bold text-slate-800">{req.name}</p>
                                                <p className="text-xs text-slate-500">{req.position} at {req.company}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button onClick={() => handleAcceptRequest(req._id, 'alumni')} className="flex-1 sm:flex-none uppercase text-xs font-bold px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded">Accept</button>
                                            <button onClick={() => handleRejectRequest(req._id, 'alumni')} className="flex-1 sm:flex-none uppercase text-xs font-bold px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded">Decline</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Follower Requests (Students)</h3>
                        {pendingRequests?.followerRequests?.length === 0 ? (
                            <p className="text-slate-500 py-4">No pending follower requests.</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests?.followerRequests?.map(req => (
                                    <div key={req._id} className="bg-white p-4 justify-between items-center rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <img src={req.profilePicture || 'https://placehold.co/100'} alt={req.name} className="w-12 h-12 rounded-full object-cover"/>
                                            <div>
                                                <p className="font-bold text-slate-800">{req.name}</p>
                                                <p className="text-xs text-slate-500">{req.course} | {req.collegeName}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button onClick={() => handleAcceptRequest(req._id, 'student')} className="flex-1 sm:flex-none uppercase text-xs font-bold px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded">Accept</button>
                                            <button onClick={() => handleRejectRequest(req._id, 'student')} className="flex-1 sm:flex-none uppercase text-xs font-bold px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded">Decline</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'connections' && (
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-6">My Connections ({myConnections.length})</h3>
                    {myConnections.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                            You don't have any connections yet. Go to Discover to find alumni!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myConnections.map((conn) => (
                                <div key={conn._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                                    <img src={conn.profilePicture || 'https://placehold.co/100'} alt={conn.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate">{conn.name}</h4>
                                        <p className="text-xs text-slate-500 truncate">{conn.position}</p>
                                        <p className="text-xs text-slate-500 truncate">{conn.company}</p>
                                        <button 
                                              onClick={() => startConversation(conn.authId, conn.role || 'alumni')}
                                            className="mt-2 text-xs font-medium text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
                                        >
                                            <MessageSquare size={12}/> Message
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default NetworkPageWithBackend;
