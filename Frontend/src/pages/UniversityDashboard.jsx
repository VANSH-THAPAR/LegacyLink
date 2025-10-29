import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

    // Backend integration code remains unchanged
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_backend_url}/fetch-total`);
                if (!response.ok) throw new Error('Data fetch failed');
                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error(err);
                // Set mock data on error so the page still renders
                setStats({ totalAlumni: 0, totalStudents: 0 });
            } finally {
                setLoading(false);
            }
        };
        // Simulate a longer loading time to see the skeleton
        setTimeout(fetchData, 1000); 
    }, []);

    // Placeholder data for new requests
    const newRequests = [
        { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john', type: 'Alumni Verification' },
        { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane', type: 'Transcript Request' },
        { name: 'Sam Wilson', avatar: 'https://i.pravatar.cc/150?u=sam', type: 'Event Registration' },
    ];

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
                                    change="+12 this month"
                                    icon={<UsersIcon />}
                                    color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                                />
                            </Link>
                            <Link to="/manage-students" className="block"> {/* Future link */}
                                <StatCard
                                    title="Current Students"
                                    value={stats?.totalStudents.toLocaleString() || '0'}
                                    change="+56 this semester"
                                    icon={<GraduationCapIcon />}
                                    color={{ bg: 'bg-green-100', text: 'text-green-600' }}
                                />
                            </Link>
                             <Link to="/funds" className="block"> {/* Future link */}
                                <StatCard
                                    title="Funds Raised"
                                    value={"$222,500"}
                                    change="+8% this quarter"
                                    icon={<DollarSignIcon />}
                                    color={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }}
                                />
                             </Link>
                        </>
                    )}
                </div>

                {/* --- Main Content Area --- */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10'>
                    
                    {/* --- Alumni Growth Chart (Placeholder) --- */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Alumni Growth</h2>
                        <div className="h-72 flex items-end justify-center bg-slate-50 rounded-lg p-4">
                           
                           <p className="text-slate-500">Chart data would be displayed here.</p>
                        </div>
                    </div>

                    {/* --- New Requests Card --- */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800">New Requests</h2>
                        <ul className="mt-4 space-y-3">
                            {newRequests.map((req, index) => (
                                <li key={index} className="flex items-center p-2 rounded-lg transition-colors hover:bg-slate-50">
                                    <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-full" />
                                    <div className="ml-3 flex-grow">
                                        <p className="font-medium text-sm text-slate-800">{req.name}</p>
                                        <p className="text-xs text-slate-500">{req.type}</p>
                                    </div>
                                    <div className="flex space-x-2 ml-auto">
                                        <button className="p-2 rounded-full text-green-600 bg-green-100 hover:bg-green-200 transition-colors"><CheckIcon className="h-4 w-4"/></button>
                                        <button className="p-2 rounded-full text-red-600 bg-red-100 hover:bg-red-200 transition-colors"><XIcon className="h-4 w-4"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                         <button className="w-full mt-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                            View All Requests
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UniversityDashboard;