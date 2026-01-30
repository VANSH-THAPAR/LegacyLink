import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import AlumniFormModal from '../components/AlumniFormModel';
import AlumniDetailModal from '../components/AlumniModelDetail';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Recharts Imports ---
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// --- Icon & UI Components ---
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const PlusIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const EditIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const DeleteIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ArrowLeftIcon = () => <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const UploadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const Spinner = () => <div className="spinner"></div>;

const ManageAlumni = () => {
    // --- State Management ---
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlumnus, setEditingAlumnus] = useState(null);
    const [viewingAlumnus, setViewingAlumnus] = useState(null);
    const [filters, setFilters] = useState({ name: '', StudentId: '', batchYear: '', degreeProgram: '', gender: '', profession: '', nationality: '' });
    const [filterOptions, setFilterOptions] = useState({ batchYears: [], degreePrograms: [], genders: [], professions: [] });
    const fileInputRef = useRef(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchFilterMetadata = async () => {
            try {
                const response = await fetch(`${API_URL}/alumni/metadata`);
                if (!response.ok) throw new Error('Could not load filter options.');
                const data = await response.json();
                setFilterOptions(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchFilterMetadata();
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        setHasSearched(true);
        setError(null);
        const queryParams = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))).toString();
        try {
            const response = await fetch(`${API_URL}/alumni/get-alumni?${queryParams}`);
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            setAlumni(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Event Handlers ---
    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const clearFilters = () => {
        setFilters({ name: '', StudentId: '', batchYear: '', degreeProgram: '', gender: '', profession: '', nationality: '' });
        setAlumni([]);
        setHasSearched(false);
    };
    const openAddModal = () => { setEditingAlumnus(null); setIsModalOpen(true); };
    const openEditModal = (alumnus, e) => {
        e.stopPropagation();
        setEditingAlumnus(alumnus);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        const isEditing = Boolean(editingAlumnus);
        const url = isEditing ? `${API_URL}/alumni/update-alumni/${editingAlumnus.StudentId}` : `${API_URL}/alumni/add-alumni`;
        const method = isEditing ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Operation failed');
            setIsModalOpen(false);
            alert(`Alumni successfully ${isEditing ? 'updated' : 'added'}!`);
            handleSearch();
        } catch (err) {
            console.error(err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleDelete = async (studentId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to permanently delete this record?')) {
            try {
                const response = await fetch(`${API_URL}/alumni/delete-alumni/${studentId}`, { method: 'DELETE' });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to delete record.');
                alert('Alumni record deleted.');
                handleSearch();
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('alumniFile', file);
        try {
            const response = await fetch(`${API_URL}/alumni/upload`, { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'File upload failed');
            alert(result.message);
            clearFilters();
        } catch (err) {
            console.error(err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    
    const triggerFileInput = () => { fileInputRef.current.click(); };

    // --- Chart Data Processing ---
    const processDataForChart = (key) => {
        const counts = alumni.reduce((acc, alumnus) => {
            const value = alumnus[key] || 'N/A';
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };
    const alumniByYear = useMemo(() => processDataForChart('batchYear').sort((a,b) => a.name - b.name), [alumni]);
    const alumniByProgram = useMemo(() => processDataForChart('degreeProgram'), [alumni]);
    const alumniByGender = useMemo(() => processDataForChart('gender'), [alumni]);
    const top5Professions = useMemo(() => processDataForChart('profession').sort((a,b) => b.value - a.value).slice(0, 5), [alumni]);
    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    // --- Main Render ---
    return (
        <>
            <AlumniFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingAlumnus} />
            <AlumniDetailModal isOpen={!!viewingAlumnus} onClose={() => setViewingAlumnus(null)} alumnus={viewingAlumnus} />
            
            <div className="bg-slate-100 min-h-screen font-sans">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Alumni Analytics</h1>
                            <p className="mt-2 text-lg text-slate-600">Analyze, filter, and manage all alumni records.</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls, .csv" />
                            <button onClick={triggerFileInput} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700">
                                <UploadIcon /> Upload Excel
                            </button>
                            <button onClick={openAddModal} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                <PlusIcon /> Add Alumni
                            </button>
                        </div>
                    </header>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Search by Name..." className="form-input" />
                            <input type="text" name="StudentId" value={filters.StudentId} onChange={handleFilterChange} placeholder="Student ID..." className="form-input" />
                            <select name="batchYear" value={filters.batchYear} onChange={handleFilterChange} className="form-input">
                                <option value="">All Batch Years</option>
                                {filterOptions.batchYears.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                            <select name="degreeProgram" value={filters.degreeProgram} onChange={handleFilterChange} className="form-input">
                                <option value="">All Programs</option>
                                {filterOptions.degreePrograms.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <select name="gender" value={filters.gender} onChange={handleFilterChange} className="form-input">
                                <option value="">All Genders</option>
                                {filterOptions.genders.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <select name="profession" value={filters.profession} onChange={handleFilterChange} className="form-input">
                                <option value="">All Professions</option>
                                {filterOptions.professions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                             <input type="text" name="nationality" value={filters.nationality} onChange={handleFilterChange} placeholder="Nationality..." className="form-input lg:col-span-2" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end space-x-3">
                            <button onClick={clearFilters} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Clear</button>
                            <button onClick={handleSearch} className="inline-flex items-center px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm"><SearchIcon/> <span className="ml-2">Search</span></button>
                        </div>
                    </div>
                    
                    {loading && <div className="text-center py-16"><Spinner /></div>}
                    {error && <div className="text-center py-16 text-red-600">Error: {error}</div>}

                    {!loading && !error && hasSearched && alumni.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="text-lg font-semibold text-slate-800 mb-4">Alumni by Batch Year</h3><ResponsiveContainer width="100%" height={350}><BarChart data={alumniByYear} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#8884d8" name="Alumni" /></BarChart></ResponsiveContainer></div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="text-lg font-semibold text-slate-800 mb-4">Top 5 Professions</h3><ResponsiveContainer width="100%" height={350}><BarChart data={top5Professions} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} /><Tooltip /><Bar dataKey="value" fill="#82ca9d" name="Alumni" /></BarChart></ResponsiveContainer></div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="text-lg font-semibold text-slate-800 mb-4">Alumni by Degree Program</h3><ResponsiveContainer width="100%" height={350}><PieChart><Pie data={alumniByProgram} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={100} label>{alumniByProgram.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip /><Legend layout="vertical" verticalAlign="middle" align="right" /></PieChart></ResponsiveContainer></div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="text-lg font-semibold text-slate-800 mb-4">Alumni by Gender</h3><ResponsiveContainer width="100%" height={350}><PieChart><Pie data={alumniByGender} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>{alumniByGender.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
                            </div>

                            <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="th-cell">Name</th>
                                                <th className="th-cell">Student ID</th>
                                                <th className="th-cell">Batch & Degree</th>
                                                <th className="th-cell text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {alumni.map((alum) => (
                                                <tr key={alum._id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setViewingAlumnus(alum)}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <img className="h-10 w-10 rounded-full object-cover" src={alum.profilePicture || alum.ProfilePicture || `https://i.pravatar.cc/150?u=${alum.StudentId}`} alt="Profile" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-slate-900">{alum.name}</div>
                                                                <div className="text-sm text-slate-500">{alum.email || alum.universityEmail}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="td-cell">{alum.rollNumber || alum.StudentId}</td>
                                                    <td className="td-cell">
                                                        <div className="text-sm text-slate-900">{alum.degreeProgram}</div>
                                                        <div className="text-sm text-slate-500">Batch of {alum.batchYear}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <div className="flex items-center justify-center space-x-4">
                                                            <button onClick={(e) => openEditModal(alum, e)} className="text-slate-500 hover:text-indigo-600 p-2 rounded-full" title="Edit"><EditIcon/></button>
                                                            <button onClick={(e) => handleDelete(alum.StudentId, e)} className="text-slate-500 hover:text-red-600 p-2 rounded-full" title="Delete"><DeleteIcon/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {!loading && hasSearched && alumni.length === 0 && (
                        <div className="text-center py-16 text-slate-500 bg-white rounded-2xl shadow-sm"><h4 className="text-lg font-medium">No Alumni Found</h4><p>Your search returned no results. Please try different filters.</p></div>
                    )}
                    
                    {!hasSearched && !loading && (
                         <div className="text-center py-16 text-slate-500 bg-white rounded-2xl shadow-sm"><h4 className="text-lg font-medium">Begin Your Research</h4><p>Use the filters above and click "Search" to load alumni data.</p></div>
                    )}
                </main>
            </div>
        </>
    );
};

export default ManageAlumni;