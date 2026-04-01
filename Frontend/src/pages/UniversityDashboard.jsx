import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Icon Components for a clean, professional look ---

const UsersIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const GraduationCapIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>
);

const DollarSignIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);

const TrendingUpIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);

const CheckIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;


// --- Reusable Components ---

const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                 {change && (
                    <div className="flex items-center mt-2 text-sm text-green-600 font-semibold">
                        <TrendingUpIcon className="w-4 h-4 mr-1"/>
                        <span>{change}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-full ${color.bg}`}>
                {React.cloneElement(icon, { className: `w-6 h-6 ${color.text}` })}
            </div>
        </div>
    </div>
);

const StatCardSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
        <div className="flex justify-between items-start">
            <div>
                <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-slate-200 rounded w-32"></div>
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
        </div>
    </div>
);


const UniversityDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);

    // Fetch dashboard data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsResponse, requestsResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_backend_url}/api/university/stats`),
                    fetch(`${import.meta.env.VITE_backend_url}/api/university/requests`)
                ]);

                if (!statsResponse.ok) throw new Error('Stats fetch failed');
                if (!requestsResponse.ok) throw new Error('Requests fetch failed');

                const statsData = await statsResponse.json();
                const requestsData = await requestsResponse.json();

                setStats(statsData);
                setRequests(requestsData);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                // Set mock data on error so the page still renders
                setStats({ 
                    totalAlumni: 2847, 
                    totalStudents: 3421,
                    recentAlumni: 127,
                    alumniByYear: [
                        { _id: '2019', count: 342 },
                        { _id: '2020', count: 418 },
                        { _id: '2021', count: 387 },
                        { _id: '2022', count: 456 },
                        { _id: '2023', count: 523 },
                        { _id: '2024', count: 721 }
                    ],
                    studentsByYear: [
                        { _id: '2021', count: 678 },
                        { _id: '2022', count: 723 },
                        { _id: '2023', count: 812 },
                        { _id: '2024', count: 891 },
                        { _id: '2025', count: 317 }
                    ],
                    alumniByProgram: [
                        { _id: 'Computer Science', count: 892 },
                        { _id: 'Business Administration', count: 634 },
                        { _id: 'Mechanical Engineering', count: 543 },
                        { _id: 'Electrical Engineering', count: 421 },
                        { _id: 'Medicine', count: 357 }
                    ]
                });
                setRequests([
                    {
                        _id: '1',
                        name: 'Priya Sharma',
                        type: 'Alumni Registration',
                        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
                    },
                    {
                        _id: '2',
                        name: 'Rahul Verma',
                        type: 'Student Verification',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
                    },
                    {
                        _id: '3',
                        name: 'Anjali Patel',
                        type: 'Alumni Registration',
                        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle request approval/rejection
    const handleRequestAction = async (requestId, action) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_backend_url}/api/university/requests/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: action }),
            });

            if (response.ok) {
                // Remove the request from the list
                setRequests(prev => prev.filter(req => req._id !== requestId));
                // Update stats if needed
                // You could show a toast notification here
            } else {
                console.error('Failed to update request');
            }
        } catch (error) {
            console.error('Error updating request:', error);
        }
    };

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">University Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-600">Welcome back! Here's a summary of campus activities.</p>
                </header>

                {/* --- Stats Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : (
                        <>
                            <Link to="/manage-alumni" className="block">
                                <StatCard
                                    title="Total Alumni"
                                    value={stats?.totalAlumni.toLocaleString() || '0'}
                                    change={`+${stats?.recentAlumni || 0} this month`}
                                    icon={<UsersIcon />}
                                    color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                                />
                            </Link>
                            <Link to="/manage-students" className="block"> {/* Future link */}
                                <StatCard
                                    title="Current Students"
                                    value={stats?.totalStudents.toLocaleString() || '0'}
                                    change={`+${Math.floor((stats?.totalStudents || 0) * 0.1)} this semester`}
                                    icon={<GraduationCapIcon />}
                                    color={{ bg: 'bg-green-100', text: 'text-green-600' }}
                                />
                            </Link>
                            <Link to="/funds" className="block"> {/* Future link */}
                                <StatCard
                                    title="Funds Raised"
                                    value={"$222,500"}
                                    change={`+8% this quarter`}
                                    icon={<DollarSignIcon />}
                                    color={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }}
                                />
                            </Link>
                        </>
                    )}
                </div>

                {/* --- Main Content Area --- */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10'>
                    
                    {/* --- Alumni Growth Chart --- */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Alumni Growth by Batch Year</h2>
                        <div className="h-72">
                            {stats?.alumniByYear?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.alumniByYear}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg p-4">
                                    <p className="text-slate-500">No alumni data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- New Requests Card --- */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-slate-800">New Requests</h2>
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {requests.length} pending
                            </span>
                        </div>
                        <ul className="mt-4 space-y-3">
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <li key={req._id} className="flex items-center p-2 rounded-lg transition-colors hover:bg-slate-50">
                                        <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-full" />
                                        <div className="ml-3 flex-grow">
                                            <p className="font-medium text-sm text-slate-800">{req.name}</p>
                                            <p className="text-xs text-slate-500">{req.type}</p>
                                        </div>
                                        <div className="flex space-x-2 ml-auto">
                                            <button 
                                                onClick={() => handleRequestAction(req._id, 'approved')}
                                                className="p-2 rounded-full text-green-600 bg-green-100 hover:bg-green-200 transition-colors"
                                                title="Approve"
                                            >
                                                <CheckIcon className="h-4 w-4"/>
                                            </button>
                                            <button 
                                                onClick={() => handleRequestAction(req._id, 'rejected')}
                                                className="p-2 rounded-full text-red-600 bg-red-100 hover:bg-red-200 transition-colors"
                                                title="Reject"
                                            >
                                                <XIcon className="h-4 w-4"/>
                                            </button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-center py-8 text-slate-500">
                                    <p>No pending requests</p>
                                </li>
                            )}
                        </ul>
                        <button className="w-full mt-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                            View All Requests
                        </button>
                    </div>
                </div>

                {/* --- Additional Analytics Section --- */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10'>
                    
                    {/* --- Degree Programs Distribution --- */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Top Degree Programs</h2>
                        <div className="h-64">
                            {stats?.alumniByProgram?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.alumniByProgram}
                                            dataKey="count"
                                            nameKey="_id"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            label={({_id, count}) => `${_id}: ${count}`}
                                        >
                                            {stats.alumniByProgram.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg p-4">
                                    <p className="text-slate-500">No program data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- Student Distribution --- */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Students by Batch Year</h2>
                        <div className="h-64">
                            {stats?.studentsByYear?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.studentsByYear}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg p-4">
                                    <p className="text-slate-500">No student data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Quick Actions Section --- */}
                <div className="mt-10 bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link to="/manage-alumni" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
                            <UsersIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Manage Alumni</span>
                        </Link>
                        <Link to="/manage-students" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
                            <GraduationCapIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Manage Students</span>
                        </Link>
                        <Link to="/view-funds" className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-center">
                            <DollarSignIcon className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                            <span className="text-sm font-medium text-indigo-800">View Funds</span>
                        </Link>
                        <Link to="/generate-reports" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
                            <TrendingUpIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                            <span className="text-sm font-medium text-purple-800">Generate Reports</span>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UniversityDashboard;