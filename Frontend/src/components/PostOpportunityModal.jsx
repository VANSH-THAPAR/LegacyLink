import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, Loader, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PostOpportunityModal = ({ onClose, onSuccess, user }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'internship',
        company: '',
        companyLogo: '',
        location: '',
        locationType: 'on-site',
        stipend: '',
        duration: '',
        skills: '',
        applyLink: '',
        contactEmail: user?.universityEmail || '',
        linkedinUrl: '',
        deadline: '',
        category: 'tech',
        experienceLevel: 'any'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);

            const response = await fetch(`${API_URL}/opportunities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    skills: skillsArray
                })
            });

            const data = await response.json();

            if (data.success) {
                onSuccess();
                onClose();
            } else {
                setError(data.msg || 'Failed to post opportunity');
            }
        } catch (err) {
            console.error('Error posting opportunity:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
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
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Post an Opportunity</h2>
                        <p className="text-slate-500 mt-1">Share internships, jobs, or collaboration opportunities</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Opportunity Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Frontend Developer Intern"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Type *</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="internship">Internship</option>
                                <option value="job">Full-time Job</option>
                                <option value="collaboration">Startup Collaboration</option>
                                <option value="project">Project</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="tech">Technology</option>
                                <option value="marketing">Marketing</option>
                                <option value="design">Design</option>
                                <option value="management">Management</option>
                                <option value="finance">Finance</option>
                                <option value="operations">Operations</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Company */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Company/Startup Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="e.g., Tech Innovations Inc."
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Location *</label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Bangalore, India"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Location Type */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Work Mode *</label>
                            <select
                                required
                                value={formData.locationType}
                                onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="on-site">On-site</option>
                                <option value="remote">Remote</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>

                        {/* Stipend/Salary */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Stipend/Salary</label>
                            <input
                                type="text"
                                value={formData.stipend}
                                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                                placeholder="e.g., ₹15,000/month or ₹8-12 LPA"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Duration</label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="e.g., 3 months or Full-time"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Application Deadline</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Experience Level */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Level</label>
                            <select
                                value={formData.experienceLevel}
                                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="any">Any Level</option>
                                <option value="entry">Entry Level</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="senior">Senior</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the role, responsibilities, and requirements..."
                                rows={5}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                            />
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Required Skills (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                placeholder="e.g., React, Node.js, MongoDB, TypeScript"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Apply Link */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Application Link</label>
                            <input
                                type="url"
                                value={formData.applyLink}
                                onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                                placeholder="https://company.com/apply"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Contact Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Email</label>
                            <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                placeholder="contact@company.com"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* LinkedIn URL */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">LinkedIn Profile/Company Page</label>
                            <input
                                type="url"
                                value={formData.linkedinUrl}
                                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                placeholder="https://linkedin.com/in/yourprofile"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    Post Opportunity
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default PostOpportunityModal;
