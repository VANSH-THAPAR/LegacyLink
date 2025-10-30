import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X, MapPin, DollarSign, Clock, Building, Globe, Laptop, Bookmark,
    ExternalLink, Mail, Linkedin, Calendar, User, Award, Briefcase,
    CheckCircle, Tag, TrendingUp
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OpportunityDetailsModal = ({ opportunity, onClose, userRole, onBookmark }) => {
    const [applying, setApplying] = useState(false);

    const typeColors = {
        internship: 'bg-blue-100 text-blue-700 border-blue-200',
        job: 'bg-green-100 text-green-700 border-green-200',
        collaboration: 'bg-purple-100 text-purple-700 border-purple-200',
        project: 'bg-orange-100 text-orange-700 border-orange-200'
    };

    const locationTypeIcons = {
        'remote': Globe,
        'on-site': Building,
        'hybrid': Laptop
    };

    const LocationIcon = locationTypeIcons[opportunity.locationType] || MapPin;

    const handleApply = async () => {
        setApplying(true);
        
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/opportunities/${opportunity._id}/apply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Open apply link if available
            if (opportunity.applyLink) {
                window.open(opportunity.applyLink, '_blank');
            }
        } catch (err) {
            console.error('Error tracking application:', err);
        } finally {
            setApplying(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-cyan-600 to-blue-600 text-white p-8 rounded-t-2xl z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-start gap-4 mb-4">
                        {opportunity.companyLogo ? (
                            <img
                                src={opportunity.companyLogo}
                                alt={opportunity.company}
                                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl border-4 border-white/20">
                                {opportunity.company.charAt(0)}
                            </div>
                        )}

                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-2">{opportunity.title}</h2>
                            <p className="text-cyan-50 text-lg font-medium">{opportunity.company}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${typeColors[opportunity.type]}`}>
                            {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
                        </span>
                        {opportunity.isFeatured && (
                            <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-yellow-100 text-yellow-700 border-2 border-yellow-200">
                                ⚡ Featured
                            </span>
                        )}
                        <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/20 backdrop-blur-sm border-2 border-white/30">
                            {opportunity.category.charAt(0).toUpperCase() + opportunity.category.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center gap-2 text-slate-600 mb-1">
                                <LocationIcon size={18} />
                                <span className="text-sm font-medium">Location</span>
                            </div>
                            <p className="font-semibold text-slate-800">{opportunity.location}</p>
                            <p className="text-sm text-slate-500">{opportunity.locationType}</p>
                        </div>

                        {opportunity.stipend && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-2 text-slate-600 mb-1">
                                    <DollarSign size={18} />
                                    <span className="text-sm font-medium">Compensation</span>
                                </div>
                                <p className="font-semibold text-slate-800">{opportunity.stipend}</p>
                            </div>
                        )}

                        {opportunity.duration && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-2 text-slate-600 mb-1">
                                    <Clock size={18} />
                                    <span className="text-sm font-medium">Duration</span>
                                </div>
                                <p className="font-semibold text-slate-800">{opportunity.duration}</p>
                            </div>
                        )}

                        {opportunity.deadline && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-2 text-slate-600 mb-1">
                                    <Calendar size={18} />
                                    <span className="text-sm font-medium">Deadline</span>
                                </div>
                                <p className="font-semibold text-slate-800">{formatDate(opportunity.deadline)}</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Briefcase size={24} className="text-cyan-600" />
                            About this Opportunity
                        </h3>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {opportunity.description}
                        </p>
                    </div>

                    {/* Skills */}
                    {opportunity.skills && opportunity.skills.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Tag size={24} className="text-cyan-600" />
                                Required Skills
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {opportunity.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-xl text-sm font-semibold border border-cyan-200"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posted By */}
                    <div className="mb-8 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-2xl p-6 border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <User size={24} className="text-cyan-600" />
                            Posted By
                        </h3>
                        <div className="flex items-center gap-4">
                            <img
                                src={opportunity.postedBy?.ProfilePicture || `https://placehold.co/64x64/3B82F6/FFFFFF?text=${opportunity.postedBy?.name?.charAt(0) || 'A'}`}
                                alt={opportunity.postedBy?.name}
                                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <div className="flex-1">
                                <p className="font-bold text-lg text-slate-800">{opportunity.postedBy?.name}</p>
                                <p className="text-slate-600">
                                    {opportunity.postedBy?.profession} at {opportunity.postedBy?.CompanyName}
                                </p>
                                <p className="text-sm text-slate-500">Batch of {opportunity.postedBy?.batchYear}</p>
                            </div>
                            {opportunity.postedBy?.LinkedInURL && (
                                <a
                                    href={opportunity.postedBy.LinkedInURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    <Linkedin size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    {(opportunity.contactEmail || opportunity.linkedinUrl) && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Contact Information</h3>
                            <div className="flex flex-wrap gap-4">
                                {opportunity.contactEmail && (
                                    <a
                                        href={`mailto:${opportunity.contactEmail}`}
                                        className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                                    >
                                        <Mail size={18} />
                                        {opportunity.contactEmail}
                                    </a>
                                )}
                                {opportunity.linkedinUrl && (
                                    <a
                                        href={opportunity.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        <Linkedin size={18} />
                                        View on LinkedIn
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-8 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} />
                            <span>{opportunity.views || 0} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={16} />
                            <span>{opportunity.applications || 0} applications</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Posted {formatDate(opportunity.createdAt)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-slate-200">
                        {userRole === 'student' && (
                            <>
                                <button
                                    onClick={() => onBookmark(opportunity._id)}
                                    className="flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <Bookmark
                                        size={20}
                                        className={opportunity.bookmarkedBy?.includes(userRole) ? 'fill-cyan-600 text-cyan-600' : ''}
                                    />
                                    {opportunity.bookmarkedBy?.includes(userRole) ? 'Bookmarked' : 'Bookmark'}
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50"
                                >
                                    <ExternalLink size={20} />
                                    {applying ? 'Opening...' : 'Apply Now'}
                                </button>
                            </>
                        )}
                        {userRole === 'alumni' && (
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default OpportunityDetailsModal;
