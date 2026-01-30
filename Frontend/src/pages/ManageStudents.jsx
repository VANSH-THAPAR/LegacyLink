import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Icon Components
const UploadIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const FilterIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const CheckIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ManageStudents = ({ user, handleLogout }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upload');
    const [stats, setStats] = useState(null);
    const [uploadData, setUploadData] = useState(null);
    const [eligibilityData, setEligibilityData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Form states for eligibility
    const [eligibilityCriteria, setEligibilityCriteria] = useState({
        minCGPA: 6.0,
        maxBacklogs: 0,
        eligibleBranches: [],
        eligibleYears: []
    });

    // Available options (these could be fetched from API)
    const [availableBranches] = useState(['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical']);
    const [availableYears] = useState(['1st Year', '2nd Year', '3rd Year', '4th Year']);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/student-management/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/student-management/upload-preview`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setUploadData(data);
            } else {
                const error = await response.json();
                alert(error.msg || 'Error uploading file');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading file');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmUpload = async () => {
        if (!uploadData || uploadData.validRows.length === 0) return;

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/student-management/confirm-upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ validRows: uploadData.validRows })
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.msg);
                setUploadData(null);
                setSelectedFile(null);
                fetchStats();
            } else {
                const error = await response.json();
                alert(error.msg || 'Error saving students');
            }
        } catch (error) {
            console.error('Confirm upload error:', error);
            alert('Error saving students');
        } finally {
            setUploading(false);
        }
    };

    const handleEligibilityCheck = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/student-management/eligibility-check`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ criteria: eligibilityCriteria })
            });

            if (response.ok) {
                const data = await response.json();
                setEligibilityData(data);
            } else {
                const error = await response.json();
                alert(error.msg || 'Error checking eligibility');
            }
        } catch (error) {
            console.error('Eligibility check error:', error);
            alert('Error checking eligibility');
        } finally {
            setLoading(false);
        }
    };

    const handleExportEligible = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            
            if (eligibilityCriteria.minCGPA) params.append('minCGPA', eligibilityCriteria.minCGPA);
            if (eligibilityCriteria.maxBacklogs !== undefined) params.append('maxBacklogs', eligibilityCriteria.maxBacklogs);
            if (eligibilityCriteria.eligibleBranches.length > 0) params.append('eligibleBranches', eligibilityCriteria.eligibleBranches.join(','));
            if (eligibilityCriteria.eligibleYears.length > 0) params.append('eligibleYears', eligibilityCriteria.eligibleYears.join(','));

            const response = await fetch(`${import.meta.env.VITE_API_URL}/student-management/export-eligible?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'eligible-students.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const error = await response.json();
                alert(error.msg || 'Error exporting students');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting students');
        }
    };

    const handleBranchToggle = (branch) => {
        setEligibilityCriteria(prev => ({
            ...prev,
            eligibleBranches: prev.eligibleBranches.includes(branch)
                ? prev.eligibleBranches.filter(b => b !== branch)
                : [...prev.eligibleBranches, branch]
        }));
    };

    const handleYearToggle = (year) => {
        setEligibilityCriteria(prev => ({
            ...prev,
            eligibleYears: prev.eligibleYears.includes(year)
                ? prev.eligibleYears.filter(y => y !== year)
                : [...prev.eligibleYears, year]
        }));
    };

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
                            <p className="text-sm text-slate-600 mt-1">Manage student data and placement eligibility</p>
                        </div>
                        <button
                            onClick={() => navigate('/university-dashboard')}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-sm font-medium text-slate-500">Total Students</h3>
                            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.overview.totalStudents}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-sm font-medium text-slate-500">Average CGPA</h3>
                            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.overview.averageCGPA?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-sm font-medium text-slate-500">Total Backlogs</h3>
                            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.overview.totalBacklogs}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-sm font-medium text-slate-500">Departments</h3>
                            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.overview.departments?.length || 0}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="border-b border-slate-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'upload'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <UploadIcon className="w-4 h-4" />
                                    <span>Bulk Upload</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('eligibility')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'eligibility'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <FilterIcon className="w-4 h-4" />
                                    <span>Eligibility Check</span>
                                </div>
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'upload' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Upload Student Data</h2>
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                                        <UploadIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600 mb-4">Upload Excel file with student data</p>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                                        >
                                            Choose File
                                        </label>
                                        {selectedFile && (
                                            <p className="mt-2 text-sm text-slate-500">Selected: {selectedFile.name}</p>
                                        )}
                                    </div>
                                </div>

                                {uploadData && (
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <h3 className="font-medium text-slate-900 mb-2">Upload Summary</h3>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-green-600 font-medium">Valid: {uploadData.validRows.length}</span>
                                                </div>
                                                <div>
                                                    <span className="text-red-600 font-medium">Invalid: {uploadData.invalidRows.length}</span>
                                                </div>
                                                <div>
                                                    <span className="text-yellow-600 font-medium">Duplicates: {uploadData.duplicateRows.length}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {uploadData.validRows.length > 0 && (
                                            <button
                                                onClick={handleConfirmUpload}
                                                disabled={uploading}
                                                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {uploading ? 'Uploading...' : `Confirm Upload (${uploadData.validRows.length} students)`}
                                            </button>
                                        )}

                                        {/* Preview Table */}
                                        {uploadData.validRows.length > 0 && (
                                            <div className="overflow-x-auto">
                                                <h3 className="font-medium text-slate-900 mb-2">Valid Students Preview</h3>
                                                <table className="min-w-full divide-y divide-slate-200">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Roll No</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Year</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CGPA</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Backlogs</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-slate-200">
                                                        {uploadData.validRows.slice(0, 10).map((row, index) => (
                                                            <tr key={index}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{row.data.roll_no}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{row.data.name}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{row.data.email}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{row.data.department}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{row.data.year}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{row.data.cgpa}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{row.data.backlogs}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {uploadData.validRows.length > 10 && (
                                                    <p className="text-sm text-slate-500 mt-2">...and {uploadData.validRows.length - 10} more rows</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'eligibility' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Placement Eligibility Criteria</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Minimum CGPA</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={eligibilityCriteria.minCGPA}
                                                onChange={(e) => setEligibilityCriteria(prev => ({ ...prev, minCGPA: parseFloat(e.target.value) }))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Maximum Backlogs</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={eligibilityCriteria.maxBacklogs}
                                                onChange={(e) => setEligibilityCriteria(prev => ({ ...prev, maxBacklogs: parseInt(e.target.value) }))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Eligible Branches</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableBranches.map(branch => (
                                                <button
                                                    key={branch}
                                                    onClick={() => handleBranchToggle(branch)}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                                        eligibilityCriteria.eligibleBranches.includes(branch)
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {branch}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Eligible Years</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableYears.map(year => (
                                                <button
                                                    key={year}
                                                    onClick={() => handleYearToggle(year)}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                                        eligibilityCriteria.eligibleYears.includes(year)
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {year}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex space-x-4">
                                        <button
                                            onClick={handleEligibilityCheck}
                                            disabled={loading}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Checking...' : 'Check Eligibility'}
                                        </button>
                                        
                                        {eligibilityData && (
                                            <button
                                                onClick={handleExportEligible}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                                            >
                                                <DownloadIcon className="w-4 h-4" />
                                                <span>Export to Excel</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {eligibilityData && (
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <h3 className="font-medium text-slate-900 mb-2">Eligibility Results</h3>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-600">Total Students: </span>
                                                    <span className="font-medium text-slate-900">{eligibilityData.summary.totalStudents}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-600">Eligible: </span>
                                                    <span className="font-medium text-green-600">{eligibilityData.summary.eligibleCount}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-600">Eligibility Rate: </span>
                                                    <span className="font-medium text-blue-600">{eligibilityData.summary.eligibilityPercentage}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Eligible Students Table */}
                                        <div className="overflow-x-auto">
                                            <h3 className="font-medium text-slate-900 mb-2">Eligible Students</h3>
                                            <table className="min-w-full divide-y divide-slate-200">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Roll No</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Year</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CGPA</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Backlogs</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-slate-200">
                                                    {eligibilityData.eligibleStudents.slice(0, 10).map((student, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.rollNumber}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.email}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.course}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.year}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.cgpa}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.backlogs}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {eligibilityData.eligibleStudents.length > 10 && (
                                                <p className="text-sm text-slate-500 mt-2">...and {eligibilityData.eligibleStudents.length - 10} more students</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ManageStudents;
