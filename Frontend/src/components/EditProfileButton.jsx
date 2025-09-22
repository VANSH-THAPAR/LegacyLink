import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X, Upload, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EditProfileButton = ({ alumni, setUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: alumni?.name || '',
        email: alumni?.email || '',
        position: alumni?.position || '',
        company: alumni?.company || '',
        location: alumni?.location || '',
        bio: alumni?.bio || '',
        linkedin: alumni?.linkedin || '',
        skills: alumni?.skills?.join(', ') || '',
        interests: alumni?.interests?.join(', ') || '',
        profilePicture: alumni?.profilePicture || ''
    });

    // Update form data when alumni prop changes
    useEffect(() => {
        if (alumni) {
            setFormData({
                name: alumni.name || '',
                email: alumni.email || '',
                position: alumni.position || '',
                company: alumni.company || '',
                location: alumni.location || '',
                bio: alumni.bio || '',
                linkedin: alumni.linkedin || '',
                skills: alumni.skills?.join(', ') || '',
                interests: alumni.interests?.join(', ') || '',
                profilePicture: alumni.profilePicture || ''
            });
        }
    }, [alumni]);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    profilePicture: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const updateData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                interests: formData.interests.split(',').map(s => s.trim()).filter(s => s)
            };

            console.log('Sending profile update:', updateData);

            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const responseData = await response.json();
            console.log('Profile update response:', responseData);

            if (response.ok) {
                console.log('Profile update successful, updating user state:', responseData);
                setUser(responseData);
                setIsModalOpen(false);
                
                // Force re-render by updating form data with new values
                setFormData({
                    name: responseData.name || '',
                    email: responseData.email || '',
                    position: responseData.position || '',
                    company: responseData.company || '',
                    location: responseData.location || '',
                    bio: responseData.bio || '',
                    linkedin: responseData.linkedin || '',
                    skills: responseData.skills?.join(', ') || '',
                    interests: responseData.interests?.join(', ') || '',
                    profilePicture: responseData.profilePicture || ''
                });
                
                alert('Profile updated successfully!');
            } else {
                console.error('Failed to update profile:', responseData);
                alert(`Failed to update profile: ${responseData.msg || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Network error occurred while updating profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-700 transition-transform hover:scale-105"
            >
                <Edit3 size={16}/> Edit Profile
            </button>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-800">Edit Profile</h2>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X size={24}/>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Profile Picture */}
                                <div className="text-center">
                                    <div className="relative inline-block">
                                        <img 
                                            src={formData.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face'} 
                                            alt="Profile" 
                                            className="w-32 h-32 rounded-full ring-4 ring-cyan-500/30 object-cover"
                                        />
                                        <label className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-700">
                                            <Upload size={16}/>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn</label>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleInputChange}
                                            placeholder="https://linkedin.com/in/yourprofile"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Skills (comma-separated)</label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleInputChange}
                                        placeholder="React, Node.js, Python, etc."
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Interests (comma-separated)</label>
                                    <input
                                        type="text"
                                        name="interests"
                                        value={formData.interests}
                                        onChange={handleInputChange}
                                        placeholder="Technology, Mentoring, Startups, etc."
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-3 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            'Saving...'
                                        ) : (
                                            <>
                                                <Save size={16}/> Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EditProfileButton;
