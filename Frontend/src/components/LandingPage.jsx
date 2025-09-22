// import React, { useState, useEffect, useRef } from 'react';
// import { GraduationCap, Building, Users, ArrowRight, LogOut, UserCircle, ArrowLeft, Mail, Lock, Hash, User, Camera } from 'lucide-react';

// // --- Configuration ---
// // This now correctly uses the environment variable from your .env file.
// const API_URL = import.meta.env.VITE_API_URL;
// console.log(API_URL)
// // --- Main App Component ---
// export default function App() {
//     // Page state now handles role-specific dashboards
//     const [page, setPage] = useState('landing');
//     const [user, setUser] = useState(null);
//     const [authRole, setAuthRole] = useState('student');

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         const userData = localStorage.getItem('user');
//         if (token && userData) {
//             const parsedUser = JSON.parse(userData);
//             setUser(parsedUser);
//             // Redirect to the correct dashboard based on the stored role
//             setPage(`${parsedUser.role}-dashboard`);
//         }
//     }, []);

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         setUser(null);
//         setPage('landing');
//     };
    
//     const handleNavigateToAuth = (role) => {
//         setAuthRole(role);
//         setPage('auth');
//     };

//     const renderPage = () => {
//         if (page === 'landing') return <LandingPage onNavigateToAuth={handleNavigateToAuth} />;
//         if (page === 'auth') return <AuthPage setPage={setPage} setUser={setUser} initialRole={authRole} />;
//         // Check if the page state ends with '-dashboard' to render the correct view
//         if (page.endsWith('-dashboard') && user) return <Dashboard user={user} handleLogout={handleLogout} />;
//         return <LandingPage onNavigateToAuth={handleNavigateToAuth} />;
//     };

//     return <div className="font-sans antialiased">{renderPage()}</div>;
// }

// // --- 1. Landing Page Component (No Changes) ---
// const LandingPage = ({ onNavigateToAuth }) => {
//     const animationStyles = `
//       @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
//       @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
//       @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//       @keyframes float { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } 100% { transform: translateY(0px) rotate(0deg); } }
//       .fade-in { animation: fadeIn 1s ease-in-out; }
//       .fade-in-down { animation: fadeInDown 0.8s ease-out; }
//       .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
//       .float-animation { animation: float 15s ease-in-out infinite; }
//     `;

//     const BackgroundGraphics = () => (
//       <div className="absolute inset-0 overflow-hidden z-0">
//         <svg className="absolute -top-1/4 -left-1/4 w-[50rem] h-[50rem] text-cyan-50 opacity-100 float-animation" style={{ animationDelay: '0s' }} viewBox="0 0 210 200" xmlns="http://www.w3.org/2000/svg">
//           <path fill="currentColor" d="M48.8,-57.8C61.4,-47.1,68.4,-30.2,69.9,-13.8C71.4,2.5,67.4,18.4,59.3,34.2C51.1,50,38.9,65.8,22.8,73.5C6.7,81.2,-13.4,80.8,-30.2,73.6C-47,66.3,-60.5,52.2,-67.2,35.6C-73.9,19,-73.9,0,-68.8,-16.1C-63.7,-32.2,-53.6,-45.4,-41.3,-55.8C-29,-66.2,-14.5,-73.8,1.4,-75.4C17.3,-77,34.6,-68.5,48.8,-57.8Z" transform="translate(100 100) scale(1.1)" />
//         </svg>
//         <svg className="absolute -bottom-1/4 -right-1/4 w-[40rem] h-[40rem] text-cyan-100 opacity-50 float-animation" style={{ animationDelay: '5s' }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
//           <path fill="currentColor" d="M48.8,-57.8C61.4,-47.1,68.4,-30.2,69.9,-13.8C71.4,2.5,67.4,18.4,59.3,34.2C51.1,50,38.9,65.8,22.8,73.5C6.7,81.2,-13.4,80.8,-30.2,73.6C-47,66.3,-60.5,52.2,-67.2,35.6C-73.9,19,-73.9,0,-68.8,-16.1C-63.7,-32.2,-53.6,-45.4,-41.3,-55.8C-29,-66.2,-14.5,-73.8,1.4,-75.4C17.3,-77,34.6,-68.5,48.8,-57.8Z" transform="translate(100 100) rotate(-120)" />
//         </svg>
//       </div>
//     );

//     return (
//         <>
//             <style>{animationStyles}</style>
//             <div className="bg-white text-slate-800 min-h-screen flex flex-col relative overflow-hidden">
//                 <BackgroundGraphics />
//                 <header className="px-8 sm:px-16 py-6 fade-in-down relative z-10">
//                     <nav className="flex justify-between items-center">
//                         <div className="flex items-center gap-2">
//                             <GraduationCap className="text-cyan-600" size={30} strokeWidth={2.5} />
//                             <h1 className="text-2xl font-bold text-slate-900">LegacyLink</h1>
//                         </div>
//                         <div className="flex items-center gap-4">
//                             <button onClick={() => onNavigateToAuth('student')} className="text-slate-600 font-medium hover:text-cyan-600 transition-colors">Login</button>
//                             <button onClick={() => onNavigateToAuth('student')} className="bg-cyan-600 text-white font-semibold px-5 py-2 rounded-full hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-sm">Sign Up</button>
//                         </div>
//                     </nav>
//                 </header>
//                 <main className="flex-grow flex flex-col items-center justify-center text-center px-4 -mt-12 relative z-10">
//                     <div className="max-w-4xl mx-auto">
//                         <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight fade-in" style={{ animationDelay: '0.2s' }}>From Shared Roots to <span className="text-cyan-600">Boundless Futures.</span></h2>
//                         <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto fade-in" style={{ animationDelay: '0.4s' }}>The official network to reconnect, mentor the next generation, and build upon your university's enduring legacy.</p>
//                     </div>
//                     <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
//                         <RoleCard onSelect={() => onNavigateToAuth('student')} icon={GraduationCap} title="I am a Student" description="Find mentors, explore career paths, and connect with inspiring alumni." delay={0.6} />
//                         <RoleCard onSelect={() => onNavigateToAuth('university')} icon={Building} title="We are a University" description="Manage your alumni network, organize events, and track engagement." delay={0.8} />
//                         <RoleCard onSelect={() => onNavigateToAuth('alumni')} icon={Users} title="I am an Alumnus" description="Give back by mentoring, networking with peers, and sharing your journey." delay={1.0} />
//                     </div>
//                 </main>
//             </div>
//         </>
//     );
// };
// const RoleCard = ({ onSelect, icon: Icon, title, description, delay }) => (
//     <div onClick={onSelect} className="group cursor-pointer">
//         <div className="p-5 min-h-[200px] bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl text-left transition-all duration-300 hover:shadow-xl hover:border-cyan-300 hover:-translate-y-2 fade-in-up" style={{ animationDelay: `${delay}s` }}>
//             <div className="flex items-center justify-between">
//                 <div className="bg-cyan-100 p-3 rounded-full"><Icon className="text-cyan-600" size={22} /></div>
//                 <ArrowRight className="text-slate-400 group-hover:text-cyan-600 transition-colors" />
//             </div>
//             <h3 className="text-xl font-semibold mt-4 text-slate-900">{title}</h3>
//             <p className="mt-2 text-base text-slate-500">{description}</p>
//         </div>
//     </div>
// );


// // --- 2. Authentication Page Component ---
// const AuthPage = ({ setPage, setUser, initialRole }) => {
//     const [isLogin, setIsLogin] = useState(true);
//     const [role] = useState(initialRole);
//     const [formData, setFormData] = useState({ profilePicture: '' });
//     const [error, setError] = useState('');
//     const [message, setMessage] = useState('');
//     const [loading, setLoading] = useState(false);
//     const fileInputRef = useRef(null);

//     const handleInputChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setFormData({ ...formData, profilePicture: reader.result });
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         setMessage('');

//         const endpoint = isLogin ? 'login' : 'signup';
//         const url = `${API_URL}/${endpoint}`;

//         try {
//             const body = isLogin ? { identifier: formData.identifier, password: formData.password } : { ...formData, role };
//             const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
//             const data = await response.json();
//             if (!response.ok) throw new Error(data.msg || 'Something went wrong.');

//             if (isLogin) {
//                 localStorage.setItem('token', data.token);
//                 localStorage.setItem('user', JSON.stringify(data.user));
//                 setUser(data.user);
//                 // Redirect to the role-specific dashboard page
//                 setPage(`${data.user.role}-dashboard`);
//             } else {
//                 setMessage('Signup successful! Please login.');
//                 setIsLogin(true);
//                 setFormData({ profilePicture: '' });
//             }
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     const roleConfig = {
//         student: { Icon: GraduationCap, title: 'Student Portal', quote: 'Unlock your future. Connect with those who have walked the path before you.', color: 'cyan', bg: 'bg-cyan-600', hoverBg: 'hover:bg-cyan-700', text: 'text-cyan-600', ring: 'focus:ring-cyan-500' },
//         alumni: { Icon: Users, title: 'Alumni Network', quote: 'Your journey continues here. Reconnect, mentor, and inspire.', color: 'indigo', bg: 'bg-indigo-600', hoverBg: 'hover:bg-indigo-700', text: 'text-indigo-600', ring: 'focus:ring-indigo-500' },
//         university: { Icon: Building, title: 'University Hub', quote: 'Empower your community. Engage students and alumni on one platform.', color: 'sky', bg: 'bg-sky-600', hoverBg: 'hover:bg-sky-700', text: 'text-sky-600', ring: 'focus:ring-sky-500' }
//     };
//     const currentConfig = roleConfig[role] || roleConfig.student;

//     const renderSignupFields = () => (
//         <>
//             { (role === 'student' || role === 'alumni') &&
//                 <div className="flex justify-center -mt-2 mb-4">
//                     <div className="relative">
//                         <img src={formData.profilePicture || `https://placehold.co/128x128/e2e8f0/64748b?text=${role.charAt(0).toUpperCase()}`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 shadow-sm" />
//                         <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md hover:bg-slate-100 transition">
//                             <Camera className={`w-5 h-5 ${currentConfig.text}`} />
//                         </button>
//                         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
//                     </div>
//                 </div>
//             }
//             {role === 'university' ? 
//                 <>
//                     <InputField name="universityName" type="text" placeholder="University Name" Icon={Building} onChange={handleInputChange} required />
//                     <InputField name="universityId" type="text" placeholder="University ID" Icon={Hash} onChange={handleInputChange} required />
//                 </> :
//                 <>
//                     <InputField name="name" type="text" placeholder="Full Name" Icon={User} onChange={handleInputChange} required />
//                     <InputField name="email" type="email" placeholder="College Email" Icon={Mail} onChange={handleInputChange} required />
//                     <InputField name="collegeName" type="text" placeholder="College Name" Icon={Building} onChange={handleInputChange} required />
//                     <InputField name="rollNumber" type="text" placeholder="College Roll Number" Icon={Hash} onChange={handleInputChange} required />
//                     <InputField name="graduatingYear" type="number" placeholder="Graduating Year" Icon={GraduationCap} onChange={handleInputChange} required />
//                 </>
//             }
//             <InputField name="password" type="password" placeholder="Password" Icon={Lock} onChange={handleInputChange} required />
//         </>
//     );

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 transition-all duration-500">
//             <div className="relative w-full max-w-4xl flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden">
//                 <button onClick={() => setPage('landing')} className="absolute top-4 left-4 text-slate-100 md:text-slate-600 hover:text-cyan-600 z-20 bg-black/20 md:bg-transparent rounded-full p-1">
//                     <ArrowLeft size={24} />
//                 </button>
//                 {/* Visual Side */}
//                 <div className={`w-full md:w-1/2 p-10 flex flex-col justify-center items-center text-white ${currentConfig.bg}`}>
//                     <currentConfig.Icon size={60} className="mb-6 drop-shadow-lg" />
//                     <h2 className="text-3xl font-bold mb-3 text-center">{currentConfig.title}</h2>
//                     <p className="text-center text-lg font-light text-white/90">"{currentConfig.quote}"</p>
//                 </div>

//                 {/* Form Side */}
//                 <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
//                     <h3 className="text-2xl font-bold text-slate-800 mb-2">{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h3>
//                     <p className="text-slate-500 mb-6">
//                         {isLogin ? `Login to the ${role} portal.` : `Sign up as a ${role}.`}
//                     </p>

//                     {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm" role="alert"><p>{error}</p></div>}
//                     {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md mb-4 text-sm" role="alert"><p>{message}</p></div>}

//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         {isLogin ? (
//                             <>
//                                 <InputField name="identifier" type="text" placeholder="Email or University ID" Icon={Mail} onChange={handleInputChange} required />
//                                 <InputField name="password" type="password" placeholder="Password" Icon={Lock} onChange={handleInputChange} required />
//                             </>
//                         ) : renderSignupFields()}
                        
//                         <button type="submit" disabled={loading} className={`w-full ${currentConfig.bg} ${currentConfig.hoverBg} text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentConfig.ring}`}>
//                             {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
//                         </button>
//                     </form>

//                     <div className="text-center mt-6">
//                         <span className="text-sm text-slate-500">
//                             {isLogin ? "Don't have an account? " : "Already have an account? "}
//                             <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }} className={`font-semibold ${currentConfig.text} hover:underline`}>
//                                 {isLogin ? "Sign Up" : "Login"}
//                             </button>
//                         </span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Reusable Input Field Component with Icon
// const InputField = ({ name, type, placeholder, Icon, onChange, required }) => (
//     <div className="relative">
//         <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
//             <Icon className="h-5 w-5 text-slate-400" />
//         </span>
//         <input
//             type={type}
//             name={name}
//             placeholder={placeholder}
//             onChange={onChange}
//             required={required}
//             className="w-full block pl-12 pr-3 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
//         />
//     </div>
// );


// // --- 3. Dashboard Component ---
// const Dashboard = ({ user, handleLogout }) => {
//     return (
//         <div className="min-h-screen bg-slate-100">
//             <header className="bg-white shadow-sm">
//                 <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
//                     <div className="flex items-center gap-2">
//                         <GraduationCap className="text-cyan-600" size={28} />
//                         <h1 className="text-xl font-bold text-slate-900">LegacyLink</h1>
//                     </div>
//                     <div className="flex items-center gap-4">
//                         <div className="flex items-center gap-3">
//                             {user.profilePicture ?
//                                 <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500" />
//                                 :
//                                 <UserCircle size={24} className="text-slate-600"/>
//                             }
//                             <span className="text-slate-700 font-medium hidden sm:block">{user.name}</span>
//                         </div>
//                         <button onClick={handleLogout} className="bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-full hover:bg-slate-300 transition-colors flex items-center gap-2">
//                             <LogOut size={16} /> Logout
//                         </button>
//                     </div>
//                 </nav>
//             </header>
//             <main className="container mx-auto p-6">
//                 <div className="bg-white p-8 rounded-lg shadow">
//                      {user.role === 'student' && <div><h2 className="text-3xl font-bold">Student Dashboard</h2><p className="text-slate-600 mt-2">Welcome, {user.name}! Find mentors and explore opportunities.</p></div>}
//                      {user.role === 'alumni' && <div><h2 className="text-3xl font-bold">Alumni Dashboard</h2><p className="text-slate-600 mt-2">Welcome back, {user.name}! Connect with peers and give back.</p></div>}
//                      {user.role === 'university' && <div><h2 className="text-3xl font-bold">University Dashboard</h2><p className="text-slate-600 mt-2">Welcome, {user.name}! Manage your alumni network here.</p></div>}
//                 </div>
//             </main>
//         </div>
//     );
// };

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building, Users, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    // Navigate to the auth page, passing the selected role in the route's state
    const handleNavigateToAuth = (role) => {
        navigate('/auth', { state: { initialRole: role } });
    };

    const animationStyles = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .fade-in { animation: fadeIn 1s ease-in-out; }
      .fade-in-down { animation: fadeInDown 0.8s ease-out; }
      .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
    `;

    return (
        <>
            <style>{animationStyles}</style>
            <div className="bg-white text-slate-800 min-h-screen flex flex-col relative overflow-hidden">
                <header className="px-8 sm:px-16 py-6 fade-in-down relative z-10">
                    <nav className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="text-cyan-600" size={30} strokeWidth={2.5} />
                            <h1 className="text-2xl font-bold text-slate-900">LegacyLink</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleNavigateToAuth('student')} className="text-slate-600 font-medium hover:text-cyan-600 transition-colors">Login</button>
                            <button onClick={() => handleNavigateToAuth('student')} className="bg-cyan-600 text-white font-semibold px-5 py-2 rounded-full hover:bg-cyan-700 shadow-sm">Sign Up</button>
                        </div>
                    </nav>
                </header>
                <main className="flex-grow flex flex-col items-center justify-center text-center px-4 -mt-12 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight fade-in">From Shared Roots to <span className="text-cyan-600">Boundless Futures.</span></h2>
                        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto fade-in">The official network to reconnect, mentor the next generation, and build upon your university's enduring legacy.</p>
                    </div>
                    <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                        <RoleCard onSelect={() => handleNavigateToAuth('student')} icon={GraduationCap} title="I am a Student" description="Find mentors, explore career paths..." delay={0.6} />
                        <RoleCard onSelect={() => handleNavigateToAuth('university')} icon={Building} title="We are a University" description="Manage your alumni network, organize events..." delay={0.8} />
                        <RoleCard onSelect={() => handleNavigateToAuth('alumni')} icon={Users} title="I am an Alumnus" description="Give back by mentoring, networking with peers..." delay={1.0} />
                    </div>
                </main>
            </div>
        </>
    );
};

const RoleCard = ({ onSelect, icon: Icon, title, description, delay }) => (
    <div onClick={onSelect} className="group cursor-pointer">
        <div className="p-5 min-h-[200px] bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 fade-in-up" style={{ animationDelay: `${delay}s` }}>
            <div className="flex items-center justify-between">
                <div className="bg-cyan-100 p-3 rounded-full"><Icon className="text-cyan-600" size={22} /></div>
                <ArrowRight className="text-slate-400 group-hover:text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold mt-4 text-slate-900">{title}</h3>
            <p className="mt-2 text-base text-slate-500">{description}</p>
        </div>
    </div>
);

export default LandingPage;