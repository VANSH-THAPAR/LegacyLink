import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Users, GraduationCap, Calendar, UserPlus, Search, Bell, Award, TrendingUp, MoreHorizontal, Sliders, Edit, PlusCircle, Send, PieChart as PieChartIcon, BarChart as BarChartIcon, Briefcase, Gift, MessageSquare, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Pie, Cell, Legend, PieChart, LineChart, Line, Tooltip } from 'recharts';

// --- HARDCODED DATA ---

const allAlumni = [
    { id: 1, name: 'Priyansh Sharma', imageUrl: '/ALUMNI1.png', graduationYear: 2015, position: 'Lead Software Engineer', company: 'Google', engagementScore: 480, isTopContributor: true, skills: ['React', 'Node.js', 'Cloud'], industry: 'Technology' },
    { id: 2, name: 'Rohan Mehta', imageUrl: '/ALUMNI2.png', graduationYear: 2018, position: 'Product Manager', company: 'Microsoft', engagementScore: 450, isTopContributor: true, skills: ['Agile', 'UX', 'Strategy'], industry: 'Technology' },
    { id: 3, name: 'Ananya Iyer', imageUrl: '/ALUMNI3.png', graduationYear: 2020, position: 'Data Scientist', company: 'Amazon', engagementScore: 420, isTopContributor: true, skills: ['Python', 'ML', 'SQL'], industry: 'Technology' },
    { id: 4, name: 'Vikram Singh', imageUrl: '/ALUMNI4.png', graduationYear: 2016, position: 'Marketing Director', company: 'Netflix', engagementScore: 390, isTopContributor: false, skills: ['SEO', 'Branding'], industry: 'Marketing' },
    { id: 5, name: 'Sneha Reddy', imageUrl: '/ALUMNI5.png', graduationYear: 2019, position: 'UX Designer', company: 'Adobe', engagementScore: 350, isTopContributor: false, skills: ['Figma', 'Web Design'], industry: 'Design' },
    { id: 6, name: 'Arjun Desai', imageUrl: '/ALUMNI6.png', graduationYear: 2017, position: 'Investment Banker', company: 'Goldman Sachs', engagementScore: 320, isTopContributor: true, skills: ['Finance', 'Modeling'], industry: 'Finance' },
    { id: 7, name: 'Isha Gupta', imageUrl: '/ALUMNI7.png', graduationYear: 2021, position: 'Junior Developer', company: 'TCS', engagementScore: 280, isTopContributor: false, skills: ['Java', 'Spring'], industry: 'Technology' },
];

const allStudents = [
    { id: 101, name: 'Vivek Thakur', imageUrl: '/vivek.jpg', enrollmentYear: 2024, major: 'Computer Science', sessionsAttended: 8, totalSessions: 10, status: 'Student' },
    { id: 102, name: 'Pushkar Jain', imageUrl: '/pushkar.jpg', enrollmentYear: 2021, major: 'Business Administration', sessionsAttended: 9, totalSessions: 10, status: 'Student' },
    { id: 103, name: 'Unnav Baruah', imageUrl: '/unnav.jpg', enrollmentYear: 2023, major: 'Mechanical Engineering', sessionsAttended: 6, totalSessions: 10, status: 'Student' },
    { id: 104, name: 'Vansh Thapar', imageUrl: '/vansh.jpg', enrollmentYear: 2022, major: 'Computer Science', sessionsAttended: 10, totalSessions: 10, status: 'Student' },
    { id: 105, name: 'Subhadeep Samanta', imageUrl: '/subhadeep.jpg', enrollmentYear: 2022, major: 'Economics', sessionsAttended: 7, totalSessions: 10, status: 'Student' },
    { id: 106, name: 'Shivansh Garg', imageUrl: '/shivansh.png', enrollmentYear: 2021, major: 'History', sessionsAttended: 1, totalSessions: 10, status: 'Student' },
    { id: 107, name: 'Nikunj Kohli', imageUrl: '/nikunj.png', enrollmentYear: 2023, major: 'Electrical Engineering', sessionsAttended: 5, totalSessions: 10, status: 'Student' },
    { id: 108, name: 'Pratham Chadda', imageUrl: '/pratham.jpg', enrollmentYear: 2023, major: 'Cyber Security', sessionsAttended: 5, totalSessions: 10, status: 'Student' },
    { id: 109, name: 'Aman Rajput', imageUrl: '/aman.png', enrollmentYear: 2024, major: 'Mechanical Engineering', sessionsAttended: 3, totalSessions: 10, status: 'Student' },
    { id: 110, name: 'Ashish Yadav', imageUrl: '/ashish.png', enrollmentYear: 2024, major: 'Data Science', sessionsAttended: 4, totalSessions: 10, status: 'Student' },
    { id: 111, name: 'Avinash Guleria', imageUrl: '/avinash.png', enrollmentYear: 2024, major: 'Business Administration', sessionsAttended: 7, totalSessions: 10, status: 'Student' },
    { id: 111, name: 'Sehaj Sharma', imageUrl: '/sehaj.png', enrollmentYear: 2024, major: 'Pharmacy', sessionsAttended: 4, totalSessions: 10, status: 'Student' },
    { id: 111, name: 'Saksham', imageUrl: '/saksham.png', enrollmentYear: 2024, major: 'Electrical Engineering', sessionsAttended: 6, totalSessions: 10, status: 'Student' },
];

const pastEvents = [
    { id: 1, title: 'AI in Modern Industry', host: 'Ananya Iyer', date: '2025-08-15', attendees: 120, studentPercent: 70, alumniPercent: 30 },
    { id: 2, title: 'Startup Pitch Night', host: 'Rohan Mehta', date: '2025-07-22', attendees: 85, studentPercent: 60, alumniPercent: 40 },
    { id: 3, title: 'Cloud Computing Workshop', host: 'Priya Sharma', date: '2025-06-05', attendees: 150, studentPercent: 80, alumniPercent: 20 },
];

const engagementHistory = [
    { month: 'Apr', engagement: 65 }, { month: 'May', engagement: 72 }, { month: 'Jun', engagement: 68 },
    { month: 'Jul', engagement: 78 }, { month: 'Aug', engagement: 85 }, { month: 'Sep', engagement: 92 },
];
const activeUsersData = [{ name: 'Active', value: 4500 }, { name: 'Inactive', value: 1800 }];
const eventAttendanceData = [{ name: 'Students', value: 355 }, { name: 'Alumni', value: 180 }];

const topIndustriesData = [
    { name: 'Technology', count: 185, fill: '#0891b2' },
    { name: 'Finance', count: 120, fill: '#0ea5e9' },
    { name: 'Marketing', count: 90, fill: '#38bdf8' },
    { name: 'Design', count: 75, fill: '#7dd3fc' },
];

const fundraisingData = [
  { month: 'Apr', amount: 150000 }, { month: 'May', amount: 180000 }, { month: 'Jun', amount: 220000 },
  { month: 'Jul', amount: 250000 }, { month: 'Aug', amount: 310000 }, { month: 'Sep', amount: 350000 },
];

const recentDonations = [
  { id: 1, name: 'Vikram Singh', amount: 50000, date: '2025-09-14', imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d', message: "This university gave me everything. It's a privilege to give back and help the next generation of leaders." },
  { id: 2, name: 'Priya Sharma', amount: 25000, date: '2025-09-12', imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', message: "My education here was the foundation of my career. I hope this contribution helps another student find their passion." },
  { id: 3, name: 'Arjun Desai', amount: 30000, date: '2025-09-10', imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026709d', message: "Forever grateful for the memories and the knowledge. This is for the place that shaped me." },
];

const COLORS = ['#0891b2', '#bae6fd'];
const COLORS_EVENTS = ['#0891b2', '#7dd3fc'];

// --- REUSABLE SUB-COMPONENTS ---

const SidebarLink = ({ icon: Icon, text, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center w-full gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
    active 
      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
      : 'text-slate-500 hover:bg-cyan-50 hover:text-cyan-600'
  }`}>
    <Icon size={20} />
    <span>{text}</span>
  </button>
);

const Header = ({ title, subtitle }) => (
    <header className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Search anything..." className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
            </div>
            <button className="p-3 rounded-full hover:bg-slate-100 transition-colors">
                <Bell className="text-slate-600" />
            </button>
        </div>
    </header>
);

// --- PAGE COMPONENTS ---

const DashboardPage = () => {
    return (
    <div>
        <Header title="Dashboard" subtitle="An overview of your alumni network's performance." />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between text-slate-500 font-medium text-sm"><span>Total Students</span><UserPlus size={20} /></div>
                    <p className="text-3xl font-bold text-slate-800 mt-2">40,346</p>
                </div>
                <p className="text-sm text-green-500 mt-4">+1525 this month</p>
            </div>
             <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between text-slate-500 font-medium text-sm"><span>Total Alumni</span><Users size={20} /></div>
                    <p className="text-3xl font-bold text-slate-800 mt-2">1,200</p>
                </div>
                <p className="text-sm text-green-500 mt-4">+5 this month</p>
            </div>
             <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between text-slate-500 font-medium text-sm"><span>Events Hosted</span><Calendar size={20} /></div>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{pastEvents.length}</p>
                </div>
                <p className="text-sm text-slate-500 mt-4">Avg. 120 attendees</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between text-slate-500 font-medium text-sm"><span>Engagement Rate</span><TrendingUp size={20} /></div>
                    <p className="text-3xl font-bold text-slate-800 mt-2">85%</p>
                </div>
                <p className="text-sm text-green-500 mt-4">+5.2% this month</p>
            </div>
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">Alumni Engagement (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={engagementHistory} margin={{ top: 40, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#64748b' }} fontSize={12} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill: '#64748b' }} fontSize={12} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                        <Bar dataKey="engagement" fill="#0891b2" radius={[4, 4, 0, 0]} barSize={40} name="Engagement" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">Active Network Users</h3>
                 <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie data={activeUsersData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                            {activeUsersData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" />
                         <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-slate-800">
                            {`${Math.round((activeUsersData[0].value / (activeUsersData[0].value + activeUsersData[1].value)) * 100)}%`}
                        </text>
                        <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-slate-500">
                            Active
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
         <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="text-cyan-600" />
                    <h3 className="text-xl font-bold text-slate-800">Top Alumni by Industry</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart layout="vertical" data={topIndustriesData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" scale="band" width={80} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false}/>
                         <Tooltip />
                         <Bar dataKey="count" barSize={25} name="Alumni">
                           {topIndustriesData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.fill} />
                           ))}
                         </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <PieChartIcon className="text-cyan-600" />
                    <h3 className="text-xl font-bold text-slate-800">Event Attendance Breakdown</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={eventAttendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                             {eventAttendanceData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS_EVENTS[index % COLORS_EVENTS.length]} />))}
                        </Pie>
                         <Tooltip />
                         <Legend iconType="circle" />
                          <text x="50%" y="42%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-slate-800">
                            {eventAttendanceData.reduce((acc, item) => acc + item.value, 0)}
                        </text>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-slate-500">
                            Total Attendees
                        </text>
                    </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
    </div>
    );
};

const ManageAlumniPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const topContributors = useMemo(() => allAlumni.filter(a => a.isTopContributor).sort((a, b) => b.engagementScore - a.engagementScore), []);
    const filteredAlumni = useMemo(() => allAlumni.filter(alumni =>
        alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [searchTerm]);

    return (
        <div>
            <Header title="Manage Alumni" subtitle="Search, filter, and connect with your alumni network." />
            <div className="mt-8 flex gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name, skill (e.g., React), etc..." 
                        className="w-full bg-white border border-slate-200 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50">
                    <Sliders size={16} /> Filters
                </button>
            </div>

            <div className="mt-8 grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8 space-y-4">
                    {filteredAlumni.map(alumni => (
                        <div key={alumni.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-6 transition-shadow hover:shadow-md">
                            <img src={alumni.imageUrl} alt={alumni.name} className="w-20 h-20 rounded-full object-cover" />
                            <div className="flex-grow">
                                <h4 className="text-lg font-bold text-slate-800">{alumni.name}</h4>
                                <p className="text-cyan-600 font-medium">{alumni.position} at {alumni.company}</p>
                                <p className="text-sm text-slate-500">Class of {alumni.graduationYear}</p>
                                <div className="mt-2 flex gap-2">
                                    {alumni.skills.map(skill => <span key={skill} className="bg-cyan-50 text-cyan-700 text-xs font-semibold px-2 py-1 rounded-full">{skill}</span>)}
                                </div>
                            </div>
                            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><MoreHorizontal /></button>
                        </div>
                    ))}
                </div>
                <aside className="col-span-12 lg:col-span-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Top Contributors</h3>
                            <Award className="text-amber-500" />
                        </div>
                        <div className="mt-4 space-y-4">
                            {topContributors.map(alumni => (
                                <div key={alumni.id} className="flex items-center gap-4">
                                    <img src={alumni.imageUrl} alt={alumni.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{alumni.name}</h4>
                                        <p className="text-sm text-slate-500">{alumni.position}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const ManageStudentsPage = () => {
    const [students, setStudents] = useState(allStudents);
    const [editingStudent, setEditingStudent] = useState(null);

    const handleStatusChange = (studentId, newStatus) => {
        setStudents(students.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
        setEditingStudent(null);
    };

    return (
        <div>
            <Header title="Manage Students" subtitle="Track student engagement and update their status." />
            <div className="mt-8 bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-200 bg-slate-50/50">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Name</th>
                            <th className="p-4 font-semibold text-slate-600">Major</th>
                            <th className="p-4 font-semibold text-slate-600">Engagement</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                                <td className="p-4 flex items-center gap-4">
                                    <img src={student.imageUrl} alt={student.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-slate-800">{student.name}</p>
                                        <p className="text-sm text-slate-500">Enrolled: {student.enrollmentYear}</p>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600">{student.major}</td>
                                <td className="p-4">
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div className="bg-cyan-600 h-2.5 rounded-full" style={{ width: `${(student.sessionsAttended / student.totalSessions) * 100}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{student.sessionsAttended}/{student.totalSessions} sessions attended</p>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${student.status === 'Student' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {editingStudent === student.id ? (
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => handleStatusChange(student.id, 'Alumni')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Set as Alumni</button>
                                            <button onClick={() => setEditingStudent(null)} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setEditingStudent(student.id)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"><Edit size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const EventsPage = () => (
    <div>
        <Header title="Events" subtitle="Analyze past events and create new ones to engage your network." />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Host an Event Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                    <PlusCircle className="text-cyan-600" />
                    <h3 className="text-xl font-bold text-slate-800">Host a New Event</h3>
                </div>
                <form className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600">Event Title</label>
                        <input type="text" placeholder="e.g., Annual Tech Summit" className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600">Invite Alumni Host</label>
                         <input type="text" placeholder="Search alumni by name..." className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600">Target Audience (by Interest)</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {['AI/ML', 'Finance', 'Entrepreneurship', 'Marketing', 'Healthcare'].map(tag => (
                                <button key={tag} type="button" className="text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-cyan-100 hover:text-cyan-800 transition-colors">{tag}</button>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-semibold py-3 rounded-lg hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-500/20">
                        <Send size={16} />
                        Create Event & Send Invites
                    </button>
                </form>
            </div>
            
            {/* Past Events Analytics Section */}
            <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <BarChartIcon className="text-cyan-600" />
                    <h3 className="text-xl font-bold text-slate-800">Past Event Analytics</h3>
                </div>
                {pastEvents.map(event => (
                    <div key={event.id} className="bg-white p-5 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-slate-800">{event.title}</p>
                                <p className="text-sm text-slate-500">Hosted by {event.host} on {event.date}</p>
                            </div>
                            <span className="text-lg font-bold text-cyan-600">{event.attendees} <span className="text-sm text-slate-500 font-medium">Attendees</span></span>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-600 mb-1">Attendee Breakdown</p>
                            <div className="flex w-full h-3 bg-cyan-100 rounded-full overflow-hidden">
                                <div className="bg-cyan-600" style={{ width: `${event.studentPercent}%` }} title={`Students: ${event.studentPercent}%`}></div>
                                <div className="bg-sky-300" style={{ width: `${event.alumniPercent}%` }} title={`Alumni: ${event.alumniPercent}%`}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const FundraisingPage = () => {
    const totalRaised = useMemo(() => fundraisingData.reduce((acc, item) => acc + item.amount, 0), []);
    const [selectedDonation, setSelectedDonation] = useState(null);
    
    return (
        <div>
            <Header title="Fundraising" subtitle="Track donations and manage campaigns." />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat cards remain the same... */}
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="text-slate-500 font-medium text-sm">Total Funds Raised</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-2">₹{totalRaised.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="text-slate-500 font-medium text-sm">Total Donors</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{recentDonations.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="text-slate-500 font-medium text-sm">Average Donation</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-2">₹{(totalRaised / recentDonations.length).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
            </div>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    {/* Line chart remains the same... */}
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Donations (Last 6 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={fundraisingData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <XAxis dataKey="month" tick={{ fill: '#64748b' }} fontSize={12} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} tick={{ fill: '#64748b' }} fontSize={12} axisLine={false} tickLine={false}/>
                            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`}/>
                            <Line type="monotone" dataKey="amount" stroke="#0891b2" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Amount Raised"/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* --- MODIFIED SECTION STARTS HERE --- */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 relative"> {/* 1. Add relative positioning */}
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Donations</h3>
                    <div className="space-y-2">
                        {recentDonations.map(donation => (
                            <button key={donation.id} onClick={() => setSelectedDonation(donation)} className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <img src={donation.imageUrl} alt={donation.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-slate-800">{donation.name}</p>
                                        <p className="text-sm text-slate-500">{donation.date}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-green-600">₹{donation.amount.toLocaleString('en-IN')}</span>
                            </button>
                        ))}
                    </div>

                    {/* 2. Move the pop-up logic inside the relative parent */}
                    {selectedDonation && (
                        <div 
                            // 3. Change positioning and background
                            className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 backdrop-blur-sm rounded-xl"
                            onClick={() => setSelectedDonation(null)}
                        >
                            <div 
                                className="bg-white p-8 rounded-xl max-w-sm w-11/12 text-center shadow-2xl m-4 transform transition-all animate-in fade-in-0 zoom-in-95 ring-1 ring-slate-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button onClick={() => setSelectedDonation(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
                                <img src={selectedDonation.imageUrl} alt={selectedDonation.name} className="w-24 h-24 rounded-full mx-auto -mt-16 border-4 border-white shadow-lg" />
                                <h3 className="font-bold text-2xl text-slate-800 mt-4">{selectedDonation.name}</h3>
                                <p className="text-green-600 font-semibold mt-1">Donated ₹{selectedDonation.amount.toLocaleString('en-IN')}</p>
                                <div className="mt-6 text-slate-600 italic border-t border-slate-200 pt-6">
                                    <MessageSquare size={18} className="inline-block mr-2 opacity-50"/>
                                    "{selectedDonation.message}"
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                 {/* --- MODIFIED SECTION ENDS HERE --- */}

            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const UniversityDashboard = () => {
    const [activePage, setActivePage] = useState('Dashboard');

    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard': return <DashboardPage />;
            case 'Manage Alumni': return <ManageAlumniPage />;
            case 'Manage Students': return <ManageStudentsPage />;
            case 'Events': return <EventsPage />;
            case 'Fundraising': return <FundraisingPage />;
            default: return <DashboardPage />;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200 flex-shrink-0 flex flex-col p-4 bg-white">
                <a href="/" className="flex items-center gap-2 px-2 py-2">
                    <GraduationCap className="text-cyan-600 flex-shrink-0" size={32} strokeWidth={2.5} />
                    <h1 className="text-2xl font-bold text-slate-800">LegacyLink</h1>
                </a>
                <nav className="mt-8 flex flex-col gap-2">
                    <SidebarLink icon={LayoutDashboard} text="Dashboard" active={activePage === 'Dashboard'} onClick={() => setActivePage('Dashboard')} />
                    <SidebarLink icon={Users} text="Manage Alumni" active={activePage === 'Manage Alumni'} onClick={() => setActivePage('Manage Alumni')} />
                    <SidebarLink icon={UserPlus} text="Manage Students" active={activePage === 'Manage Students'} onClick={() => setActivePage('Manage Students')} />
                    <SidebarLink icon={Calendar} text="Events" active={activePage === 'Events'} onClick={() => setActivePage('Events')} />
                    <SidebarLink icon={Gift} text="Fundraising" active={activePage === 'Fundraising'} onClick={() => setActivePage('Fundraising')} />
                </nav>
                <div className="mt-auto bg-cyan-50 border-2 border-dashed border-cyan-200 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-cyan-800">Upgrade Your Plan</h4>
                    <p className="text-xs text-cyan-700 mt-1">Get advanced analytics and unlimited event hosting.</p>
                    <button className="mt-3 w-full bg-cyan-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-cyan-700">Upgrade Now</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
};

export default UniversityDashboard;