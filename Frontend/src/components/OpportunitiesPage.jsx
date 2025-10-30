import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Search, Filter, MapPin, Calendar, DollarSign, Clock,
    Building, User, Bookmark, ExternalLink, X, Plus, ChevronDown,
    TrendingUp, Zap, Globe, Laptop, Users, Target, Award, Mail,
    Linkedin, CheckCircle, AlertCircle, Loader, ArrowRight, Tag
} from 'lucide-react';
import OpportunityCard from './OpportunityCard';
import PostOpportunityModal from './PostOpportunityModal';
import OpportunityDetailsModal from './OpportunityDetailsModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OpportunitiesPage = ({ user, userRole }) => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    
    const [filters, setFilters] = useState({
        type: 'all',
        locationType: 'all',
        category: 'all',
        sort: 'newest'
    });

    const fetchOpportunities = useCallback(async () => {
        setLoading(true);
        setError('');
        
        try {
            const queryParams = new URLSearchParams();
            
            if (activeTab !== 'all') queryParams.append('type', activeTab);
            if (filters.locationType !== 'all') queryParams.append('locationType', filters.locationType);
            if (filters.category !== 'all') queryParams.append('category', filters.category);
            if (searchQuery) queryParams.append('search', searchQuery);
            queryParams.append('sort', filters.sort);

            const response = await fetch(`${API_URL}/opportunities?${queryParams.toString()}`);
            const data = await response.json();

            if (data.success) {
                setOpportunities(data.data);
            } else {
                setError(data.msg || 'Failed to fetch opportunities');
            }
        } catch (err) {
            console.error('Error fetching opportunities:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [activeTab, filters, searchQuery]);

    useEffect(() => {
        fetchOpportunities();
    }, [fetchOpportunities]);

    const tabs = [
        { id: 'all', label: 'All Opportunities', icon: Briefcase },
        { id: 'internship', label: 'Internships', icon: Clock },
        { id: 'job', label: 'Jobs', icon: Building },
        { id: 'collaboration', label: 'Alumni Startups', icon: Users },
        { id: 'project', label: 'Projects', icon: Target }
    ];

    const handleBookmark = async (opportunityId) => {
        if (userRole !== 'student') return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/opportunities/${opportunityId}/bookmark`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                fetchOpportunities();
            }
        } catch (err) {
            console.error('Error bookmarking:', err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-600 rounded-2xl p-8 md:p-12 text-white overflow-hidden"
            >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Briefcase size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">Opportunities & Collaborations</h1>
                            <p className="text-cyan-50 mt-1">Explore internships, placements, and alumni startups to grow your career</p>
                        </div>
                    </div>
                    
                    {userRole === 'alumni' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowPostModal(true)}
                            className="mt-4 flex items-center gap-2 bg-white text-cyan-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus size={20} />
                            Post an Opportunity
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, company, skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                            showFilters 
                                ? 'bg-cyan-600 text-white' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        <Filter size={20} />
                        Filters
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <select
                        value={filters.sort}
                        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                        className="px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="deadline">Deadline Soon</option>
                        <option value="popular">Most Popular</option>
                        <option value="featured">Featured</option>
                    </select>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Location Type</label>
                                <select
                                    value={filters.locationType}
                                    onChange={(e) => setFilters({ ...filters, locationType: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="all">All Locations</option>
                                    <option value="remote">Remote</option>
                                    <option value="on-site">On-site</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="tech">Technology</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="design">Design</option>
                                    <option value="management">Management</option>
                                    <option value="finance">Finance</option>
                                    <option value="operations">Operations</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={() => setFilters({ type: 'all', locationType: 'all', category: 'all', sort: 'newest' })}
                                    className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            >
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                                isActive
                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                            }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Opportunities Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader className="animate-spin text-cyan-600" size={40} />
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-2" size={40} />
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            ) : opportunities.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
                    <Briefcase className="mx-auto text-slate-400 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No opportunities found</h3>
                    <p className="text-slate-500">Try adjusting your filters or check back later for new postings.</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    {opportunities.map((opportunity, index) => (
                        <OpportunityCard
                            key={opportunity._id}
                            opportunity={opportunity}
                            index={index}
                            userRole={userRole}
                            onBookmark={handleBookmark}
                            onViewDetails={setSelectedOpportunity}
                        />
                    ))}
                </motion.div>
            )}

            <AnimatePresence>
                {showPostModal && (
                    <PostOpportunityModal
                        onClose={() => setShowPostModal(false)}
                        onSuccess={fetchOpportunities}
                        user={user}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedOpportunity && (
                    <OpportunityDetailsModal
                        opportunity={selectedOpportunity}
                        onClose={() => setSelectedOpportunity(null)}
                        userRole={userRole}
                        onBookmark={handleBookmark}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default OpportunitiesPage;
