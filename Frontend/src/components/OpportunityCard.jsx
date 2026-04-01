import React from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, DollarSign, Clock, Building, Globe, Laptop, Bookmark,
    ArrowRight, Zap
} from 'lucide-react';

const OpportunityCard = ({ opportunity, index, userRole, onBookmark, onViewDetails }) => {
    const typeColors = {
        internship: 'bg-blue-100 text-blue-700',
        job: 'bg-green-100 text-green-700',
        collaboration: 'bg-purple-100 text-purple-700',
        project: 'bg-orange-100 text-orange-700'
    };

    const locationTypeIcons = {
        'remote': Globe,
        'on-site': Building,
        'hybrid': Laptop
    };

    const LocationIcon = locationTypeIcons[opportunity.locationType] || MapPin;

    const isExpiringSoon = opportunity.deadline && 
        new Date(opportunity.deadline) - new Date() < 7 * 24 * 60 * 60 * 1000;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-cyan-300 transition-all cursor-pointer group"
            onClick={() => onViewDetails(opportunity)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                    {opportunity.companyLogo ? (
                        <img
                            src={opportunity.companyLogo}
                            alt={opportunity.company}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                            {opportunity.company.charAt(0)}
                        </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-cyan-600 transition-colors line-clamp-1">
                            {opportunity.title}
                        </h3>
                        <p className="text-slate-600 font-medium">{opportunity.company}</p>
                    </div>
                </div>

                {userRole === 'student' && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onBookmark(opportunity._id);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Bookmark
                            size={20}
                            className={opportunity.bookmarkedBy?.includes(userRole) ? 'fill-cyan-600 text-cyan-600' : 'text-slate-400'}
                        />
                    </motion.button>
                )}
            </div>

            {/* Type Badge */}
            <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[opportunity.type]}`}>
                    {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
                </span>
                {opportunity.isFeatured && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1">
                        <Zap size={12} />
                        Featured
                    </span>
                )}
                {isExpiringSoon && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                        <Clock size={12} />
                        Expiring Soon
                    </span>
                )}
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                {opportunity.description}
            </p>

            {/* Details */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <LocationIcon size={16} className="text-slate-400" />
                    <span>{opportunity.location} • {opportunity.locationType}</span>
                </div>
                
                {opportunity.stipend && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign size={16} className="text-slate-400" />
                        <span>{opportunity.stipend}</span>
                    </div>
                )}
                
                {opportunity.duration && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={16} className="text-slate-400" />
                        <span>{opportunity.duration}</span>
                    </div>
                )}
            </div>

            {/* Skills */}
            {opportunity.skills && opportunity.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {opportunity.skills.slice(0, 3).map((skill, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                        >
                            {skill}
                        </span>
                    ))}
                    {opportunity.skills.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                            +{opportunity.skills.length - 3} more
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                    <img
                        src={opportunity.postedBy?.ProfilePicture || `https://placehold.co/32x32/3B82F6/FFFFFF?text=${opportunity.postedBy?.name?.charAt(0) || 'A'}`}
                        alt={opportunity.postedBy?.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-slate-200"
                    />
                    <div className="text-xs">
                        <p className="font-semibold text-slate-700">{opportunity.postedBy?.name}</p>
                        <p className="text-slate-500">Batch {opportunity.postedBy?.batchYear}</p>
                    </div>
                </div>

                <ArrowRight size={20} className="text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
            </div>
        </motion.div>
    );
};

export default OpportunityCard;
