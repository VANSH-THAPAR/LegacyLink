// src/components/StudentDetailModal.jsx
import React from 'react';

// Reusable InfoItem
const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-base text-slate-800">{value || 'N/A'}</p>
    </div>
);

const StudentDetailModal = ({ isOpen, onClose, student }) => {
    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Student Profile</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* --- Left Column: Photo & Key Info --- */}
                        <div className="lg:col-span-1 flex flex-col items-center text-center">
                            <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg mb-4 flex items-center justify-center overflow-hidden bg-slate-200">
                                {student.profilePicture || student.ProfilePicture ? (
                                    <img
                                        src={student.profilePicture || student.ProfilePicture}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg className="w-24 h-24 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{student.name}</h3>
                            <p className="text-md text-slate-600">{student.degreeProgram}</p>
                            <p className="text-sm text-slate-500">Batch of {student.batchYear}</p>
                            
                            <div className="w-full mt-6 space-y-4 text-left">
                                <InfoItem label="University Email" value={student.universityEmail} />
                                <InfoItem label="Contact Number" value={student.contactNumber} />
                                <InfoItem label="Personal Email" value={student.personalEmail} />
                            </div>
                        </div>

                        {/* --- Right Column: Detailed Info --- */}
                        <div className="lg:col-span-2">
                            <h4 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Personal Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Gender" value={student.gender} />
                                <InfoItem label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'} />
                                <InfoItem label="Nationality" value={student.nationality} />
                                <InfoItem label="Father's Name" value={student.fatherName} />
                                <InfoItem label="Mother's Name" value={student.motherName} />
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="p-4 bg-slate-50 border-t flex justify-end rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;