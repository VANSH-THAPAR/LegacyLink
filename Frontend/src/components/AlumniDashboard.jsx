import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, MessageSquare, Users, Calendar, User, Search, Bell, Award, Briefcase, Send, Check, X, Star, MapPin, Building, Link, Edit3, LogOut, Settings, MoreVertical, Paperclip, Smile, GraduationCap, ChevronDown, Gift, HeartHandshake, CheckCircle2 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import EditProfileButton from './EditProfileButton';
import MessagesPageWithBackend from './MessagesPageWithBackend';
import NetworkPageWithBackend from './NetworkPageWithBackend';
import EventsPageWithBackend from './EventsPageWithBackend';

// --- ENHANCED HARDCODED DATA ---

const loggedInAlumni = {
    id: 2,
    name: 'Rohan Mehta',
    imageUrl: 'https://imgcdn.stablediffusionweb.com/2024/5/6/2b1d888a-a22f-49d5-94b2-d9e1fb2c2640.jpg',
    position: 'Product Manager',
    company: 'Microsoft',
    location: 'Bengaluru, India',
    connections: 280,
    mentees: 5,
    eventsHosted: 4,
    profileViews: 128,
    profileCompletion: 85,
    isTopContributor: true,
    about: "Passionate Product Manager with a knack for building user-centric products. I enjoy mentoring students and giving back to the community that shaped me.",
    careerTimeline: [
        { year: 2025, role: 'Senior Product Manager', company: 'Microsoft', icon: Briefcase },
        { year: 2022, role: 'Product Manager', company: 'Microsoft', icon: Briefcase },
        { year: 2019, role: 'Associate Product Manager', company: 'Swiggy', icon: Briefcase },
        { year: 2018, role: 'Graduated from University', company: 'B.Tech, Computer Science', icon: Award },
    ],
    skills: ['Agile Methodologies', 'UX/UI Principles', 'Product Strategy', 'Market Research', 'JIRA', 'SQL'],
};

const messages = [
    { id: 1, sender: 'Aditya Verma', student: true, text: "Hi Rohan, thanks for agreeing to mentor me. I've shared my resume in your email.", time: '10:45 AM', unread: true, imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026711d' },
    { id: 2, sender: 'Priya Sharma', student: false, text: "Hey! Great connecting with you. Let's catch up sometime next week.", time: 'Yesterday', unread: false, imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: 3, sender: 'Meera Nair', student: true, text: "The session on business administration was really insightful. Thank you!", time: 'Wednesday', unread: false, imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026712d' },
    { id: 4, sender: 'Rahul Singh', student: true, text: "Could you help me with my product management interview preparation?", time: '2 days ago', unread: false, imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026713d' },
    { id: 5, sender: 'Ananya Iyer', student: false, text: "Thanks for the LinkedIn recommendation! It really helped.", time: '3 days ago', unread: false, imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
    { id: 6, sender: 'Karthik Reddy', student: true, text: "Hi! I'm interested in transitioning to product management. Can we schedule a call?", time: '1 week ago', unread: false, imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026714d' },
];

// Detailed conversation data for each contact
const conversationsData = {
    1: [
        { sender: "them", text: "Hi Rohan, thanks for agreeing to mentor me. I've shared my resume in your email.", timestamp: "10:30 AM" },
        { sender: "me", text: "Hi Aditya! I've received your resume. It looks great! Let's schedule a call this week to discuss your career goals.", timestamp: "10:45 AM" },
        { sender: "them", text: "That would be amazing! I'm free Tuesday or Wednesday evening. What works for you?", timestamp: "10:47 AM" },
        { sender: "me", text: "Wednesday at 6 PM works perfectly. I'll send you a calendar invite.", timestamp: "10:50 AM" },
        { sender: "them", text: "Perfect! Looking forward to it. Should I prepare anything specific for our discussion?", timestamp: "10:52 AM" },
        { sender: "me", text: "Just think about your short-term and long-term career goals. We'll discuss how to get there!", timestamp: "10:55 AM" },
    ],
    2: [
        { sender: "them", text: "Hey! Great connecting with you. Let's catch up sometime next week.", timestamp: "Yesterday 3:20 PM" },
        { sender: "me", text: "Absolutely! It was great meeting you at the alumni event. How about coffee on Friday?", timestamp: "Yesterday 4:15 PM" },
        { sender: "them", text: "Friday sounds perfect! There's a nice café near my office. I'll share the location.", timestamp: "Yesterday 4:30 PM" },
    ],
    3: [
        { sender: "them", text: "The session on business administration was really insightful. Thank you!", timestamp: "Wednesday 2:15 PM" },
        { sender: "me", text: "I'm so glad you found it helpful, Meera! Feel free to reach out if you have any follow-up questions.", timestamp: "Wednesday 2:45 PM" },
        { sender: "them", text: "I do have a question about market research methodologies. Could we discuss it briefly?", timestamp: "Wednesday 3:00 PM" },
        { sender: "me", text: "Of course! Market research is crucial for product success. What specific aspect are you curious about?", timestamp: "Wednesday 3:10 PM" },
    ],
    4: [
        { sender: "them", text: "Could you help me with my product management interview preparation?", timestamp: "2 days ago" },
        { sender: "me", text: "Absolutely, Rahul! I'd be happy to help. What company are you interviewing with?", timestamp: "2 days ago" },
        { sender: "them", text: "It's with Flipkart for an APM role. I'm particularly nervous about the case study round.", timestamp: "2 days ago" },
        { sender: "me", text: "Great choice! Case studies are all about structured thinking. Let's do a mock interview this weekend.", timestamp: "2 days ago" },
    ],
    5: [
        { sender: "them", text: "Thanks for the LinkedIn recommendation! It really helped.", timestamp: "3 days ago" },
        { sender: "me", text: "You're very welcome, Ananya! You deserved every word of it. How did the interview go?", timestamp: "3 days ago" },
        { sender: "them", text: "I got the job! Starting as a Senior Data Scientist at Amazon next month!", timestamp: "3 days ago" },
        { sender: "me", text: "That's fantastic news! Congratulations! Amazon is lucky to have you.", timestamp: "3 days ago" },
    ],
    6: [
        { sender: "them", text: "Hi! I'm interested in transitioning to product management. Can we schedule a call?", timestamp: "1 week ago" },
        { sender: "me", text: "Hi Karthik! I'd love to help with your transition. What's your current background?", timestamp: "1 week ago" },
        { sender: "them", text: "I'm currently a software engineer with 3 years of experience. I want to move to the business side.", timestamp: "1 week ago" },
        { sender: "me", text: "That's a great foundation! Your technical background will be a huge asset in PM. Let's chat next week.", timestamp: "1 week ago" },
    ],
};

const eventInvitations = [
    { id: 1, title: 'Annual Tech Summit 2025', role: 'Keynote Speaker', date: 'Oct 20, 2025', status: 'Pending' },
    { id: 2, title: 'Career Fair: Product Roles', role: 'Panelist', date: 'Nov 12, 2025', status: 'Accepted' },
];

const availableEvents = [
    { id: 3, title: 'Workshop: Breaking into PM', expertise: 'Product Management' },
    { id: 4, title: 'AMA Session with Seniors', expertise: 'General Career Advice' },
];

const networkAlumni = [
     { id: 1, name: 'Priya Sharma', imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', position: 'Lead Software Engineer', company: 'Google' },
     { id: 3, name: 'Ananya Iyer', imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', position: 'Data Scientist', company: 'Amazon' },
     { id: 6, name: 'Arjun Desai', imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026709d', position: 'Investment Banker', company: 'Goldman Sachs' },
];

// --- REUSABLE & ANIMATED COMPONENTS ---

const SidebarLink = ({ icon: Icon, text, active, onClick }) => (
  <motion.button 
    onClick={onClick} 
    className={`flex items-center w-full gap-3.5 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 relative ${
    active ? 'text-white' : 'text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 font-medium'
  }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
  >
    {active && (
      <motion.div
        layoutId="active-sidebar-link"
        className="absolute inset-0 bg-cyan-600 rounded-lg shadow-lg shadow-cyan-500/30"
        style={{ borderRadius: 8 }}
      />
    )}
    <Icon size={20} className="relative z-10" />
    <span className="relative z-10 font-semibold truncate">{text}</span>
  </motion.button>
);

const Header = ({ alumni, setActivePage, handleLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
    <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
    >
        <div className="overflow-hidden">
            <h2 className="text-3xl font-bold text-slate-800 truncate">Welcome back, {alumni.name.split(' ')[0]}!</h2>
            <p className="text-slate-500 mt-1 truncate">Here's what's happening with your network today.</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Search..." className="w-64 bg-white border border-slate-200 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
            </div>
            <motion.button whileHover={{rotate: [0, 20, -15, 0]}} className="p-3 rounded-full hover:bg-slate-100 transition-colors">
                <Bell className="text-slate-600" />
            </motion.button>
            <div className="relative" ref={dropdownRef}>
                <motion.button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                    <img 
                        src={alumni.profilePicture || alumni.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face'} 
                        alt={alumni.name || 'User'} 
                        className="w-10 h-10 rounded-full object-cover" 
                    />
                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}/>
                </motion.button>
                <AnimatePresence>
                {dropdownOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-20"
                    >
                        <div className="p-2 border-b border-slate-100 mb-2">
                            <p className="font-bold text-slate-800 truncate">{alumni.name}</p>
                            <p className="text-sm text-slate-500 truncate">{alumni.position}</p>
                        </div>
                        <button onClick={() => { setActivePage('Profile'); setDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"><User size={16}/> View Profile</button>
                        <button onClick={() => setDropdownOpen(false)} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"><Settings size={16}/> Settings</button>
                        <button onClick={() => { handleLogout(); setDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 mt-2 border-t border-slate-100 text-red-500 hover:bg-red-50"><LogOut size={16}/> Logout</button>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>
    </motion.header>
    );
};

// --- ALUMNI-FACING PAGE COMPONENTS ---
// **CORRECTION**: Moved all page components outside the main AlumniDashboard component

const AlumniDashboardPage = ({ alumni = {}, setActivePage }) => {
    // Set default values if properties are missing
    const menteesCount = alumni.mentees || 0;
    const connectionsCount = alumni.connections || 0;
    const profileViewsCount = alumni.profileViews || 0;
    
    // Calculate actual profile completion percentage
    const calculateProfileCompletion = (user) => {
        const requiredFields = [
            'name',
            'email', 
            'position',
            'company',
            'location',
            'about',
            'bio',
            'graduatingYear',
            'collegeName',
            'universityName'
        ];
        
        const optionalFields = [
            'profilePicture',
            'imageUrl',
            'linkedin',
            'skills',
            'careerTimeline',
            'industry',
            'mentorshipAreas'
        ];
        
        let completedRequired = 0;
        let completedOptional = 0;
        
        // Check required fields (70% weight)
        requiredFields.forEach(field => {
            if (user[field] && user[field].toString().trim() !== '') {
                completedRequired++;
            }
        });
        
        // Check optional fields (30% weight)
        optionalFields.forEach(field => {
            if (user[field]) {
                if (Array.isArray(user[field]) && user[field].length > 0) {
                    completedOptional++;
                } else if (user[field].toString().trim() !== '') {
                    completedOptional++;
                }
            }
        });
        
        // Calculate weighted completion percentage
        const requiredPercentage = (completedRequired / requiredFields.length) * 70;
        const optionalPercentage = (completedOptional / optionalFields.length) * 30;
        
        return Math.round(requiredPercentage + optionalPercentage);
    };
    
    // Get missing fields for helpful suggestions
    const getMissingFields = (user) => {
        const importantFields = [
            { key: 'about', label: 'About/Bio' },
            { key: 'bio', label: 'Bio' },
            { key: 'linkedin', label: 'LinkedIn Profile' },
            { key: 'skills', label: 'Skills' },
            { key: 'careerTimeline', label: 'Career Timeline' },
            { key: 'industry', label: 'Industry' },
            { key: 'profilePicture', label: 'Profile Picture' },
            { key: 'imageUrl', label: 'Profile Picture' }
        ];
        
        const missing = importantFields.filter(field => {
            if (!user[field.key]) return true;
            if (Array.isArray(user[field.key]) && user[field.key].length === 0) return true;
            if (user[field.key].toString().trim() === '') return true;
            return false;
        });
        
        return missing.slice(0, 3); // Show only top 3 missing fields
    };
    
    const profileCompletion = calculateProfileCompletion(alumni);
    const missingFields = getMissingFields(alumni);
    
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        >
            <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'My Mentees', value: menteesCount, Icon: Users, color: 'cyan' },
                        { title: 'My Connections', value: connectionsCount, Icon: Link, color: 'sky' },
                        { title: 'Profile Views', value: profileViewsCount, Icon: User, color: 'blue' }
                    ].map((stat, i) => (
                        <motion.div 
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
                        >
                            <div className={`p-3 rounded-full w-fit bg-${stat.color}-100 text-${stat.color}-600 mb-4`}>
                                <stat.Icon />
                            </div>
                            <p className="text-4xl font-bold text-slate-800">{stat.value}</p>
                            <p className="text-slate-500 font-medium truncate">{stat.title}</p>
                        </motion.div>
                    ))}
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                >
                    <h3 className="text-xl font-bold text-slate-800">My Invitations</h3>
                    <div className="mt-4 space-y-4">
                        {(alumni.eventInvitations || eventInvitations || []).slice(0, 2).map(event => (
                            <div key={event.id} className="p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-slate-800 truncate">{event.title}</p>
                                    <p className="text-sm text-slate-500 truncate">
                                        You're invited as a <span className="font-medium text-cyan-600">{event.role}</span>
                                    </p>
                                </div>
                                {event.status === 'Pending' && (
                                    <button className="bg-cyan-500 text-white px-3 py-1 text-sm rounded-full font-semibold hover:bg-cyan-600 flex-shrink-0 ml-2">
                                        Respond
                                    </button>
                                )}
                                {event.status === 'Accepted' && (
                                    <span className="flex items-center gap-1 text-sm text-green-600 font-semibold flex-shrink-0 ml-2">
                                        <Check size={16}/> Accepted
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
            <div className="lg:col-span-1 space-y-8 sticky top-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center"
                >
                    <h3 className="text-xl font-bold text-slate-800">Profile Completion</h3>
                    <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                            {/* Background circle (full circle) */}
                            <Pie 
                                data={[{name: 'Background', value: 100}]} 
                                dataKey="value" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={50} 
                                outerRadius={60} 
                                startAngle={0} 
                                endAngle={360} 
                                fill="#e2e8f0" 
                                isAnimationActive={false}
                            />
                            {/* Progress circle (colored based on completion) */}
                            <Pie 
                                data={[{name: 'Completed', value: profileCompletion}]} 
                                dataKey="value" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={50} 
                                outerRadius={60} 
                                startAngle={-90} 
                                endAngle={-90 + (profileCompletion * 3.6)} 
                                cornerRadius={6}
                                animationDuration={800}
                            >
                                <Cell fill={
                                    profileCompletion >= 80 ? "#10b981" : // Green for 80%+
                                    profileCompletion >= 60 ? "#0891b2" : // Cyan for 60-79%
                                    profileCompletion >= 40 ? "#f59e0b" : // Yellow for 40-59%
                                    "#ef4444" // Red for <40%
                                }/>
                            </Pie>
                            <text 
                                x="50%" 
                                y="50%" 
                                textAnchor="middle" 
                                dominantBaseline="middle" 
                                className="text-3xl font-bold fill-slate-800"
                            >
                                {`${profileCompletion}%`}
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                    {profileCompletion < 100 && missingFields.length > 0 && (
                        <div className="mt-3 text-left">
                            <p className="text-xs text-slate-500 mb-2">Missing:</p>
                            <div className="space-y-1">
                                {missingFields.map((field, index) => (
                                    <div key={index} className="text-xs text-slate-600 flex items-center gap-1">
                                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                        {field.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button 
                        onClick={() => setActivePage && setActivePage('Profile')}
                        className={`w-full text-center mt-3 p-2 rounded-lg font-semibold text-sm transition-colors ${
                            profileCompletion === 100 
                                ? 'bg-green-100 text-green-700 cursor-default' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        {profileCompletion === 100 ? '✓ Profile Complete' : 'Complete Profile'}
                    </button>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                >
                    <h3 className="text-xl font-bold text-slate-800">Recent Messages</h3>
                    <div className="mt-4 space-y-3">
                        {(alumni.messages || messages || []).slice(0, 2).map(msg => (
                            <div key={msg.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
                                <img 
                                    src={msg.imageUrl} 
                                    alt={msg.sender}
                                    className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                                />
                                <div className="overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-slate-800 text-sm truncate">
                                            {msg.sender}
                                        </p>
                                        <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">
                                            {msg.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">
                                        {msg.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const MessagesPage = () => {
    const [selectedMsg, setSelectedMsg] = useState(messages[0]);
    const [conversations, setConversations] = useState(conversationsData);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversations, selectedMsg]);

    const activeConversation = conversations[selectedMsg.id] || [];

    const handleSend = () => {
        if (input.trim()) {
            const newMessage = {
                sender: "me",
                text: input.trim(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setConversations(prev => ({
                ...prev,
                [selectedMsg.id]: [...(prev[selectedMsg.id] || []), newMessage]
            }));
            setInput("");
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-1/3 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">Inbox</h3>
                    <p className="text-sm text-slate-500 mt-1">{messages.length} conversations</p>
                </div>
                <div className="p-2 overflow-y-auto">
                    {messages.map(msg => (
                        <motion.button key={msg.id} onClick={() => setSelectedMsg(msg)} 
                            className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-colors ${selectedMsg.id === msg.id ? 'bg-cyan-50 border border-cyan-200' : 'hover:bg-slate-50'}`}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="relative">
                                <img src={msg.imageUrl} className="w-12 h-12 rounded-full flex-shrink-0 object-cover" alt={msg.sender}/>
                                {msg.unread && <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full"></div>}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-slate-800 truncate">{msg.sender}</p>
                                    <p className="text-xs text-slate-400 flex-shrink-0">{msg.time}</p>
                                </div>
                                <p className={`text-sm truncate ${msg.unread ? 'font-bold text-slate-700' : 'text-slate-500'}`}>{msg.text}</p>
                                {msg.student && <span className="inline-block mt-1 text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">Student</span>}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
            <div className="w-2/3 flex flex-col">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={selectedMsg.imageUrl} className="w-10 h-10 rounded-full object-cover" alt={selectedMsg.sender}/>
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg truncate">{selectedMsg.sender}</h4>
                            {selectedMsg.student && <p className="text-xs text-cyan-600 font-semibold">Student Mentee</p>}
                        </div>
                    </div>
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><MoreVertical /></button>
                </div>
                <div className="flex-grow p-6 bg-slate-50/50 overflow-y-auto space-y-4">
                    {activeConversation.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words ${
                                msg.sender === "me" 
                                    ? "bg-cyan-500 text-white" 
                                    : "bg-white text-slate-700 border border-slate-200"
                            }`}>
                                <p>{msg.text}</p>
                                <p className={`text-xs mt-1 ${msg.sender === "me" ? "text-cyan-100" : "text-slate-400"}`}>
                                    {msg.timestamp}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
                    <button className="p-3 text-slate-500 hover:bg-slate-100 rounded-full"><Paperclip/></button>
                    <button className="p-3 text-slate-500 hover:bg-slate-100 rounded-full"><Smile/></button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Message ${selectedMsg.sender}...`} 
                        className="w-full bg-slate-100 border-transparent rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button 
                        onClick={handleSend}
                        className="p-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-transform hover:scale-110"
                    >
                        <Send/>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const NetworkPage = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <h2 className="text-3xl font-bold text-slate-800">My Network</h2>
        <p className="text-slate-500 mt-1">Connect with fellow alumni and expand your professional circle.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {networkAlumni.map((alumni, i) => (
                <motion.div 
                    key={alumni.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 text-center flex flex-col items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                    <img src={alumni.imageUrl} alt={alumni.name} className="w-24 h-24 rounded-full ring-4 ring-slate-100" />
                    <h4 className="mt-4 text-lg font-bold text-slate-800 truncate">{alumni.name}</h4>
                    <p className="text-sm text-cyan-600 font-medium truncate">{alumni.position}</p>
                    <p className="text-sm text-slate-500 truncate">{alumni.company}</p>
                    <div className="mt-4 flex gap-3">
                        <button className="bg-cyan-600 text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-cyan-700 transition-transform hover:scale-105">Connect</button>
                        <button className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-full text-sm hover:bg-slate-200">Message</button>
                    </div>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

const EventsPage = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <h2 className="text-3xl font-bold text-slate-800">Events Center</h2>
        <p className="text-slate-500 mt-1">Respond to invitations and discover new hosting opportunities.</p>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">My Invitations</h3>
                <div className="space-y-4">
                    {eventInvitations.map((event, i) => (
                        <motion.div 
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
                        >
                            <p className="font-bold text-slate-800 truncate">{event.title}</p>
                            <p className="text-sm text-slate-500 truncate">Role: <span className="font-medium text-cyan-600">{event.role}</span> | Date: {event.date}</p>
                            <div className="mt-4 flex gap-3">
                                <button className="flex items-center gap-1.5 bg-green-100 text-green-700 font-semibold px-4 py-2 rounded-full text-sm hover:bg-green-200 transition-transform hover:scale-105"><Check size={16}/> Accept</button>
                                <button className="flex items-center gap-1.5 bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-full text-sm hover:bg-red-200 transition-transform hover:scale-105"><X size={16}/> Decline</button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Available to Host</h3>
                <div className="space-y-4">
                    {availableEvents.map((event, i) => (
                        <motion.div 
                            key={event.id} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm"
                        >
                            <div className="overflow-hidden">
                                <p className="font-bold text-slate-800 truncate">{event.title}</p>
                                <p className="text-sm text-slate-500 truncate">Expertise: <span className="font-medium text-cyan-600">{event.expertise}</span></p>
                            </div>
                            <button className="bg-cyan-50 text-cyan-700 font-semibold px-4 py-2 rounded-full text-sm hover:bg-cyan-100 transition-transform hover:scale-105 ml-2 flex-shrink-0">Apply</button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

const ProfilePage = ({ alumni, setUser }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
            <motion.div initial={{ opacity: 0, y:20 }} animate={{opacity: 1, y:0}} transition={{delay: 0.1}} className="bg-white p-6 rounded-2xl border border-slate-200 text-center flex flex-col items-center sticky top-8 shadow-sm">
                <img src={alumni.profilePicture || alumni.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face'} alt={alumni.name} className="w-32 h-32 rounded-full ring-4 ring-cyan-500/30 object-cover" />
                <h3 className="mt-4 text-2xl font-bold text-slate-800 truncate">{alumni.name || 'Alumni User'}</h3>
                <p className="text-cyan-600 font-medium truncate">{alumni.position || 'Position not specified'}</p>
                {alumni.company && (
                    <div className="mt-2 flex items-center gap-1.5 text-slate-500 text-sm">
                        <Building size={14}/> {alumni.company}
                    </div>
                )}
                {alumni.location && (
                    <div className="mt-1 flex items-center gap-1.5 text-slate-500 text-sm">
                        <MapPin size={14}/> {alumni.location}
                    </div>
                )}
                {alumni.industry && (
                    <div className="mt-1 flex items-center gap-1.5 text-slate-500 text-sm">
                        <Briefcase size={14}/> {alumni.industry}
                    </div>
                )}
                {alumni.linkedin && (
                    <div className="mt-3">
                        <a 
                            href={alumni.linkedin.startsWith('http') ? alumni.linkedin : `https://linkedin.com/in/${alumni.linkedin}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors"
                        >
                            <Link size={14}/> LinkedIn
                        </a>
                    </div>
                )}
                {alumni.isTopContributor && (
                    <div className="mt-4 flex items-center gap-2 bg-amber-100 text-amber-700 font-semibold px-4 py-2 rounded-full text-sm">
                        <Award size={16}/> Top Contributor
                    </div>
                )}
                <EditProfileButton alumni={alumni} setUser={setUser} />
            </motion.div>
        </div>
        <div className="col-span-12 lg:col-span-8 space-y-8">
            <motion.div initial={{ opacity: 0, y:20 }} animate={{opacity: 1, y:0}} transition={{delay: 0.2}} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-xl font-bold text-slate-800">About</h4>
                <p className="mt-2 text-slate-600 leading-relaxed break-words">{alumni.bio || alumni.about || 'No bio available yet. Click Edit Profile to add one.'}</p>
            </motion.div>
            {alumni.careerTimeline && alumni.careerTimeline.length > 0 && (
                <motion.div initial={{ opacity: 0, y:20 }} animate={{opacity: 1, y:0}} transition={{delay: 0.3}} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xl font-bold text-slate-800">Career Timeline</h4>
                    <div className="mt-4 relative">
                        <div className="absolute left-4 top-2 h-full border-l-2 border-slate-200"></div>
                        {alumni.careerTimeline.map((item) => (
                            <div key={item.year} className="relative pl-12 mb-6">
                                <div className="absolute left-0 top-1 w-8 h-8 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center">
                                   <item.icon size={16}/>
                                </div>
                                <p className="text-sm text-slate-500 font-medium">{item.year}</p>
                                <h5 className="font-bold text-slate-800 truncate">{item.role}</h5>
                                <p className="text-sm text-slate-600 truncate">{item.company}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
            {alumni.skills && alumni.skills.length > 0 && (
                <motion.div initial={{ opacity: 0, y:20 }} animate={{opacity: 1, y:0}} transition={{delay: 0.4}} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xl font-bold text-slate-800">Skills</h4>
                    <div className="mt-3 flex flex-wrap gap-3">
                        {alumni.skills.map(skill => <span key={skill} className="bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1.5 rounded-lg">{skill}</span>)}
                    </div>
                </motion.div>
            )}
            
            {/* Education Information */}
            {(alumni.universityName || alumni.collegeName || alumni.graduatingYear) && (
                <motion.div initial={{ opacity: 0, y:20 }} animate={{opacity: 1, y:0}} transition={{delay: 0.5}} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xl font-bold text-slate-800">Education</h4>
                    <div className="mt-3 space-y-2">
                        {alumni.universityName && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <GraduationCap size={16} className="text-cyan-600"/>
                                <span>{alumni.universityName}</span>
                            </div>
                        )}
                        {alumni.collegeName && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <Building size={16} className="text-cyan-600"/>
                                <span>{alumni.collegeName}</span>
                            </div>
                        )}
                        {alumni.graduatingYear && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <Calendar size={16} className="text-cyan-600"/>
                                <span>Graduated in {alumni.graduatingYear}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Mentorship Information */}
            {alumni.isMentor && (
                <motion.div initial={{ opacity: 0, y:20 }} animate={{opacity: 1, y:0}} transition={{delay: 0.6}} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xl font-bold text-slate-800">Mentorship</h4>
                    <div className="mt-3">
                        <div className="flex items-center gap-2 text-green-600 font-semibold mb-3">
                            <HeartHandshake size={16}/>
                            <span>Available as Mentor</span>
                        </div>
                        {alumni.mentorshipAreas && alumni.mentorshipAreas.length > 0 && (
                            <div>
                                <p className="text-sm text-slate-500 mb-2">Mentorship Areas:</p>
                                <div className="flex flex-wrap gap-2">
                                    {alumni.mentorshipAreas.map(area => (
                                        <span key={area} className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {alumni.maxMentees && (
                            <p className="text-sm text-slate-600 mt-2">
                                Can mentor up to {alumni.maxMentees} students
                            </p>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    </motion.div>
);

// --- DONATION MODAL COMPONENT ---

const DonationModal = ({ isOpen, onClose, alumni }) => {
    const presetAmounts = [500, 1000, 2500, 5000];
    const causes = ['Scholarship Fund', 'Campus Development', 'Research & Innovation'];

    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState(1000);
    const [customAmount, setCustomAmount] = useState('');
    const [cause, setCause] = useState('Scholarship Fund');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [cardDetails, setCardDetails] = useState({
        number: '•••• •••• •••• ••••',
        name: alumni.name.toUpperCase(),
        expiry: '••/••',
    });

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen, alumni.name]); // Added alumni.name dependency

    const handleAmountSelect = (val) => {
        setAmount(val);
        setCustomAmount('');
    };
    
    const handleCustomAmountChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setCustomAmount(val);
        setAmount(val ? parseInt(val, 10) : 0);
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'number') {
            formattedValue = value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
        } else if (name === 'expiry') {
            formattedValue = value.replace(/[^\d]/g, '').replace(/(.{2})/, '$1/').trim().slice(0, 5);
        }
        setCardDetails(prev => ({...prev, [name]: formattedValue }));
    }

    const handlePayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setStep(3);
        }, 2000);
    };

    const resetForm = () => {
        setStep(1);
        setAmount(1000);
        setCustomAmount('');
        setCause('Scholarship Fund');
        setCardDetails({ number: '•••• •••• •••• ••••', name: alumni.name.toUpperCase(), expiry: '••/••' });
    }

    const StepIndicator = ({ currentStep }) => (
        <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= s ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {currentStep > s ? <Check size={16}/> : s}
                    </div>
                    {s < 3 && <div className={`w-12 h-1 rounded-full ${currentStep > s ? 'bg-cyan-600' : 'bg-slate-200'}`}></div>}
                </div>
            ))}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-50 w-full max-w-4xl rounded-2xl shadow-2xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
                    >
                        <div className="p-8 bg-white hidden lg:block">
                            <h2 className="text-3xl font-bold text-slate-800">Shape the Future</h2>
                            <p className="text-slate-500 mt-2">Your contribution empowers the next generation of leaders and innovators.</p>
                            <div className="mt-8 space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="p-3 bg-cyan-100 text-cyan-600 rounded-lg"><GraduationCap /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Fund a Scholarship</h4>
                                        <p className="text-sm text-slate-500">Directly support students with academic excellence and financial need.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="p-3 bg-sky-100 text-sky-600 rounded-lg"><Building /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Enhance Campus Life</h4>
                                        <p className="text-sm text-slate-500">Contribute to new facilities and resources that enrich the student experience.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 relative">
                             <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X/></button>
                            <StepIndicator currentStep={step} />
                             <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div key="step1" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}}>
                                        <h3 className="font-bold text-slate-800 text-lg">Choose Your Donation</h3>
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            {presetAmounts.map(pa => (
                                                <button key={pa} onClick={() => handleAmountSelect(pa)} className={`p-3 rounded-lg font-bold text-center border-2 transition-all ${amount === pa && !customAmount ? 'bg-cyan-600 text-white border-cyan-600 ring-2 ring-cyan-300' : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-500'}`}>
                                                    ₹{pa.toLocaleString('en-IN')}
                                                </button>
                                            ))}
                                        </div>
                                        <input type="text" value={customAmount} onChange={handleCustomAmountChange} placeholder="Or enter a custom amount" className="w-full mt-3 p-3 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                        
                                        <h3 className="font-bold text-slate-800 text-lg mt-6">Select a Cause</h3>
                                        <div className="space-y-2 mt-3">
                                            {causes.map(c => (
                                                <button key={c} onClick={() => setCause(c)} className={`w-full text-left p-3 rounded-lg font-semibold flex items-center gap-3 border-2 transition-all ${cause === c ? 'bg-cyan-50 border-cyan-500 text-cyan-700' : 'border-transparent hover:bg-white'}`}>
                                                   <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${cause === c ? 'border-cyan-600' : 'border-slate-300'}`}>{cause === c && <div className="w-2.5 h-2.5 bg-cyan-600 rounded-full"></div>}</div>{c}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => setStep(2)} disabled={!amount || amount <= 0} className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 disabled:bg-slate-300 transition-all">Proceed to Payment</button>
                                    </motion.div>
                                )}
                                {step === 2 && (
                                     <motion.div key="step2" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}}>
                                        <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-2xl relative overflow-hidden"><div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div><div className="absolute -bottom-8 -left-2 w-32 h-32 bg-white/5 rounded-full"></div><p className="font-mono text-xl tracking-widest">{cardDetails.number}</p><div className="flex justify-between items-end mt-4"><p className="font-mono text-sm uppercase">{cardDetails.name}</p><p className="font-mono text-sm">{cardDetails.expiry}</p></div></div>
                                        <div className="space-y-3">
                                            <input name="number" value={cardDetails.number.replace(/•/g, '').trim()} onChange={handleCardInputChange} placeholder="Card Number" className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                                            <input name="name" value={cardDetails.name} onChange={handleCardInputChange} placeholder="Name on Card" className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                                            <div className="grid grid-cols-2 gap-3">
                                               <input name="expiry" value={cardDetails.expiry.replace(/\//g, '').replace(/•/g, '').trim()} onChange={handleCardInputChange} placeholder="Expiry (MM/YY)" className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                                               <input placeholder="CVC" className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                                            </div>
                                        </div>
                                        <button onClick={handlePayment} disabled={isProcessing} className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 disabled:bg-slate-300 transition-all flex items-center justify-center">{isProcessing ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}</button>
                                    </motion.div>
                                )}
                                {step === 3 && (
                                     <motion.div key="step3" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="text-center flex flex-col items-center justify-center h-full min-h-[450px]">
                                        <CheckCircle2 className="text-green-500" size={80} />
                                        <h3 className="text-2xl font-bold text-slate-800 mt-4">Thank You, {alumni.name.split(' ')[0]}!</h3>
                                        <p className="text-slate-500 mt-1">Your generous donation of <span className="font-bold text-cyan-600">₹{amount.toLocaleString('en-IN')}</span> for the "{cause}" has been received.</p>
                                        <button onClick={resetForm} className="w-full mt-8 bg-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-300 transition-all">Make Another Donation</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- MAIN ALUMNI DASHBOARD COMPONENT ---

const AlumniDashboard = ({ user, handleLogout, setUser }) => {
    const [activePage, setActivePage] = useState('Dashboard');
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard': return <AlumniDashboardPage alumni={user} setActivePage={setActivePage} />;
            case 'Messages': return <MessagesPage />;
            case 'Network': return <NetworkPageWithBackend user={user} />;
            case 'Events': return <EventsPageWithBackend user={user} />;
            case 'Profile': return <ProfilePage alumni={user} setUser={setUser} />;
            default: return <AlumniDashboardPage alumni={user} setActivePage={setActivePage} />;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex font-sans">
            <aside className="w-64 border-r border-slate-200 flex-shrink-0 flex flex-col p-4 bg-white">
                <a href="/" className="flex items-center gap-2 px-2 py-2">
                    <GraduationCap className="text-cyan-600 flex-shrink-0" size={32} strokeWidth={2.5} />
                    <h1 className="text-2xl font-bold text-slate-800">LegacyLink</h1>
                </a>
                <nav className="mt-10 flex flex-col gap-3">
                    <SidebarLink icon={LayoutDashboard} text="Dashboard" active={activePage === 'Dashboard'} onClick={() => setActivePage('Dashboard')} />
                    <SidebarLink icon={MessageSquare} text="Messages" active={activePage === 'Messages'} onClick={() => setActivePage('Messages')} />
                    <SidebarLink icon={Users} text="Network" active={activePage === 'Network'} onClick={() => setActivePage('Network')} />
                    <SidebarLink icon={Calendar} text="Events" active={activePage === 'Events'} onClick={() => setActivePage('Events')} />
                    <SidebarLink icon={Gift} text="Giving Back" onClick={() => setIsDonationModalOpen(true)} />
                    <SidebarLink icon={User} text="Profile" active={activePage === 'Profile'} onClick={() => setActivePage('Profile')} />
                </nav>
                <div className="mt-auto">
                      <motion.div 
                        className="bg-slate-100 p-4 rounded-lg text-center"
                        initial={{ opacity: 0, y:20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                     >
                        <h4 className="font-bold text-slate-800">Share Your Expertise</h4>
                        <p className="text-xs text-slate-500 mt-1">Become a mentor and shape the future for current students.</p>
                        <button className="mt-3 w-full bg-cyan-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-cyan-700 transition-transform hover:scale-105">Get Started</button>
                       </motion.div>
                       <div className="mt-4 border-t pt-4">
                           <SidebarLink icon={Settings} text="Settings" onClick={() => {}} />
                           <SidebarLink icon={LogOut} text="Logout" onClick={handleLogout} />
                       </div>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                 <Header alumni={user} setActivePage={setActivePage} handleLogout={handleLogout} />
                 <div className="mt-8">
                     <AnimatePresence mode="wait">
                         <motion.div
                             key={activePage}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -10 }}
                             transition={{ duration: 0.2 }}
                         >
                            {renderPage()}
                         </motion.div>
                     </AnimatePresence>
                 </div>
            </main>

            <DonationModal 
                isOpen={isDonationModalOpen} 
                onClose={() => setIsDonationModalOpen(false)}
                alumni={user}
            />
        </div>
    );
};

export default AlumniDashboard;