import React from 'react';

// A small helper component to keep the layout clean
const InfoItem = ({ label, value, isLink = false }) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {isLink && value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-base text-indigo-600 hover:underline break-words">
                {value}
            </a>
        ) : (
            <p className="text-base text-slate-800">{value || 'N/A'}</p>
        )}
    </div>
);

const AlumniDetailModal = ({ isOpen, onClose, alumnus }) => {
    if (!isOpen || !alumnus) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Alumni Profile</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* --- Left Column: Photo & Key Info --- */}
                        <div className="lg:col-span-1 flex flex-col items-center text-center">
                            <img
                                src={alumnus.ProfilePicture || `https://i.pravatar.cc/150?u=${alumnus.StudentId}`}
                                alt="Profile"
                                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                            />
                            <h3 className="text-2xl font-bold text-slate-900">{alumnus.name}</h3>
                            <p className="text-md text-slate-600">{alumnus.degreeProgram}</p>
                            <p className="text-sm text-slate-500">Batch of {alumnus.batchYear}</p>
                            
                            <div className="w-full mt-6 space-y-4 text-left">
                                <InfoItem label="University Email" value={alumnus.universityEmail} />
                                <InfoItem label="Contact Number" value={alumnus.contactNumber} />
                                <InfoItem label="LinkedIn Profile" value={alumnus.LinkedInURL} isLink={true} />
                            </div>
                        </div>

                        {/* --- Right Column: Detailed Info --- */}
                        <div className="lg:col-span-2">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Professional Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoItem label="Profession" value={alumnus.profession} />
                                        <InfoItem label="Company" value={alumnus.CompanyName} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Personal Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoItem label="Gender" value={alumnus.gender} />
                                        <InfoItem label="Date of Birth" value={alumnus.dob ? new Date(alumnus.dob).toLocaleDateString() : 'N/A'} />
                                        <InfoItem label="Nationality" value={alumnus.nationality} />
                                        <InfoItem label="Personal Email" value={alumnus.personalEmail} />
                                        <InfoItem label="Father's Name" value={alumnus.fatherName} />
                                        <InfoItem label="Mother's Name" value={alumnus.motherName} />
                                    </div>
                                </div>
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

export default AlumniDetailModal;