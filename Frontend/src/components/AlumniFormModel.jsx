// src/components/AlumniFormModal.jsx
import React, { useState, useEffect } from 'react';

// Reusable Input Field
const InputField = ({ label, name, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            className="form-input mt-1"
        />
    </div>
);

const AlumniFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // When initialData (for editing) changes, update the form
        if (initialData) {
            setFormData(initialData);
        } else {
            // Clear form for 'Add'
            setFormData({});
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const isEditing = Boolean(initialData);

    return (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edit Alumni' : 'Add New Alumni'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Key Info */}
                        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                        <InputField label="Student ID" name="StudentId" value={formData.StudentId} onChange={handleChange} required disabled={isEditing} />
                        <InputField label="University Email" name="universityEmail" value={formData.universityEmail} onChange={handleChange} type="email" required />
                        <InputField label="Personal Email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} type="email" />
                        <InputField label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
                        <InputField label="Profile Picture URL" name="ProfilePicture" value={formData.ProfilePicture} onChange={handleChange} />

                        {/* Academic Info */}
                        <InputField label="Batch Year" name="batchYear" value={formData.batchYear} onChange={handleChange} type="number" required />
                        <InputField label="Degree Program" name="degreeProgram" value={formData.degreeProgram} onChange={handleChange} required />
                        
                        {/* Personal Info */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Gender</label>
                            <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="form-input mt-1">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <InputField label="Date of Birth" name="dob" value={formData.dob ? formData.dob.split('T')[0] : ''} onChange={handleChange} type="date" />
                        <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
                        
                        {/* Professional Info */}
                        <InputField label="Profession" name="profession" value={formData.profession} onChange={handleChange} />
                        <InputField label="Company Name" name="CompanyName" value={formData.CompanyName} onChange={handleChange} />
                        <InputField label="LinkedIn URL" name="LinkedInURL" value={formData.LinkedInURL} onChange={handleChange} />
                    </div>

                    <div className="p-4 bg-white mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">
                            {isEditing ? 'Save Changes' : 'Add Alumni'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AlumniFormModal;