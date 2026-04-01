// src/pages/ManageStudent.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import StudentFormModal from '../components/AlumniFormModel'; // We will create this
import StudentDetailModal from '../components/StudentDetailModel'; // We will create this

// --- Recharts Imports ---
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// --- Icon & UI Components (You can move these to a separate file, e.g., src/components/Icons.jsx) ---
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const PlusIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const EditIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const DeleteIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const UploadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const Spinner = () => <div className="spinner"></div>;

// Reusable Chart Card
const ChartCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
        <div className="h-80">
            {children}
        </div>
    </div>
);


const ManageStudent = () => {
    // --- State Management ---
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [filters, setFilters] = useState({ name: '', StudentId: '', batchYear: '', degreeProgram: '', gender: '' });
    const [filterOptions, setFilterOptions] = useState({ batchYears: [], degreePrograms: [], genders: [] });
    const fileInputRef = useRef(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchFilterMetadata = async () => {
            try {
                // IMPORTANT: Make sure this backend endpoint exists
                const response = await fetch(`${import.meta.env.VITE_backend_url}/student-metadata`);
                if (!response.ok) throw new Error('Could not load filter options.');
                const data = await response.json();
                setFilterOptions(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchFilterMetadata();
    }, []);

    const handleSearch = useCallback(async () => {
        setLoading(true);
        setHasSearched(true);
        setError(null);
        const queryParams = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))).toString();
        try {
            // IMPORTANT: Changed API endpoint
            const response = await fetch(`${import.meta.env.VITE_backend_url}/get-students?${queryParams}`);
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            setStudents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // --- Event Handlers ---
    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const clearFilters = () => {
        setFilters({ name: '', StudentId: '', batchYear: '', degreeProgram: '', gender: '' });
        setStudents([]);
        setHasSearched(false);
    };
    const openAddModal = () => { setEditingStudent(null); setIsModalOpen(true); };
    const openEditModal = (student, e) => {
        e.stopPropagation();
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        const isEditing = Boolean(editingStudent);
        // IMPORTANT: Changed API endpoints
        const url = isEditing ? `${import.meta.env.VITE_backend_url}/update-student/${editingStudent.StudentId}` : `${import.meta.env.VITE_backend_url}/add-student`;
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
            alert(`Student successfully ${isEditing ? 'updated' : 'added'}!`);
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
                 // IMPORTANT: Changed API endpoint
                const response = await fetch(`${import.meta.env.VITE_backend_url}/delete-student/${studentId}`, { method: 'DELETE' });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to delete record.');
                
                alert('Student record deleted.');
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
        formData.append('studentFile', file);
        try {
             // IMPORTANT: Changed API endpoint
            const response = await fetch(`${import.meta.env.VITE_backend_url}/upload-students`, { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'File upload failed');
            
            alert(result.message);
            clearFilters();
            handleSearch();
        } catch (err) {
            console.error(err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const triggerFileInput = () => { fileInputRef.current.click(); };

    // --- Chart Data Processing ---
    const processDataForChart = useCallback((key) => {
        const counts = students.reduce((acc, student) => {
            const value = student[key] || 'N/A';
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [students]);

    const studentsByYear = useMemo(() => processDataForChart('batchYear').sort((a,b) => a.name - b.name), [students, processDataForChart]);
    const studentsByProgram = useMemo(() => processDataForChart('degreeProgram'), [students, processDataForChart]);
    const studentsByGender = useMemo(() => processDataForChart('gender'), [students, processDataForChart]);
    
    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    // --- Main Render ---
    return (
        <>
            <StudentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingStudent} />
            <StudentDetailModal isOpen={!!viewingStudent} onClose={() => setViewingStudent(null)} student={viewingStudent} />
            
            <div className="bg-slate-100 min-h-screen font-sans">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Student Analytics</h1>
                            <p className="mt-2 text-lg text-slate-600">Analyze, filter, and manage all student records.</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls, .csv" />
                            <button onClick={triggerFileInput} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700">
                                <UploadIcon /> Upload Excel
                            </button>
                            <button onClick={openAddModal} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                <PlusIcon /> Add Student
                            </button>
                        </div>
                    </header>
                    
                    {/* --- Filter Section --- */}
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
                            <select name="gender" value={filters.gender} onChange={handleFilterChange} className="form-input lg:col-span-2">
                                <option value="">All Genders</option>
                                {filterOptions.genders.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end space-x-3">
                            <button onClick={clearFilters} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Clear</button>
                            <button onClick={handleSearch} disabled={loading} className="inline-flex items-center px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm disabled:opacity-50">
                                {loading ? <Spinner/> : <><SearchIcon/> <span className="ml-2">Search</span></>}
                            </button>
                        </div>
                    </div>
                    
                    {loading && <div className="text-center py-16"><Spinner /></div>}
                    {error && <div className="text-center py-16 text-red-600">Error: {error}</div>}

                    {!loading && !error && hasSearched && students.length > 0 && (
                        <>
                            {/* --- Charts/Graphs Section --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                                <ChartCard title="Students by Batch Year">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={studentsByYear} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" fontSize={12} />
                                            <YAxis allowDecimals={false} fontSize={12} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" name="Students" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                                
                                <ChartCard title="Students by Degree Program">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={studentsByProgram} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                                {studentsByProgram.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                                
                                <ChartCard title="Students by Gender">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={studentsByGender} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                                                {studentsByGender.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            {/* --- Results Table --- */}
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
                                            {students.map((student) => (
                                                <tr key={student._id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setViewingStudent(student)}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <img className="h-10 w-10 rounded-full object-cover" src={student.ProfilePicture || `https://i.pravatar.cc/150?u=${student.StudentId}`} alt="Profile" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-slate-900">{student.name}</div>
                                                                <div className="text-sm text-slate-500">{student.universityEmail}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="td-cell">{student.StudentId}</td>
                                                    <td className="td-cell">
                                                        <div className="text-sm text-slate-900">{student.degreeProgram}</div>
                                                        <div className="text-sm text-slate-500">Batch of {student.batchYear}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <div className="flex items-center justify-center space-x-4">
                                                            <button onClick={(e) => openEditModal(student, e)} className="text-slate-500 hover:text-indigo-600 p-2 rounded-full hover:bg-slate-100" title="Edit"><EditIcon/></button>
                                                            <button onClick={(e) => handleDelete(student.StudentId, e)} className="text-slate-500 hover:text-red-600 p-2 rounded-full hover:bg-slate-100" title="Delete"><DeleteIcon/></button>
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

                    {!loading && hasSearched && students.length === 0 && (
                        <div className="text-center py-16 text-slate-500 bg-white rounded-2xl shadow-sm"><h4 className="text-lg font-medium">No Students Found</h4><p>Your search returned no results. Please try different filters.</p></div>
                    )}
                    
                    {!hasSearched && !loading && (
                         <div className="text-center py-16 text-slate-500 bg-white rounded-2xl shadow-sm"><h4 className="text-lg font-medium">Begin Your Research</h4><p>Use the filters above and click "Search" to load student data.</p></div>
                    )}
                </main>
            </div>
        </>
    );
};

export default ManageStudent;