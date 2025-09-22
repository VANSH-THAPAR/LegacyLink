import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Building, Users, ArrowLeft, Mail, Lock, Hash, User, Camera } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthPage = ({ setUser }) => {
    const navigate = useNavigate();
    const location = useLocation();
    // Get role from navigation state, default to 'student'
    const initialRole = location.state?.initialRole || 'student';

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ profilePicture: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, profilePicture: reader.result }); // Base64 for upload
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        const endpoint = isLogin ? 'login' : 'signup';
        // **FIXED URL**: Correctly constructs the API path (e.g., /api/auth/login)
        const url = `${API_URL}/auth/${endpoint}`;

        try {
            const body = isLogin ? { identifier: formData.identifier, password: formData.password } : { ...formData, role: initialRole };
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Something went wrong.');

            if (isLogin) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                navigate(`/${data.user.role}`); // Navigate to the correct dashboard
            } else {
                setMessage('Signup successful! Please login.');
                setIsLogin(true); // Switch to login form
                setFormData({ profilePicture: '' }); // Clear form
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const roleConfig = {
        student: { Icon: GraduationCap, title: 'Student Portal', quote: 'Unlock your future.', bg: 'bg-cyan-600', text: 'text-cyan-600' },
        alumni: { Icon: Users, title: 'Alumni Network', quote: 'Your journey continues here.', bg: 'bg-indigo-600', text: 'text-indigo-600' },
        university: { Icon: Building, title: 'University Hub', quote: 'Empower your community.', bg: 'bg-sky-600', text: 'text-sky-600' }
    };
    const currentConfig = roleConfig[initialRole] || roleConfig.student;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="relative w-full max-w-4xl flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden">
                <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-slate-100 md:text-slate-600 z-20 p-1">
                    <ArrowLeft size={24} />
                </button>
                <div className={`w-full md:w-1/2 p-10 flex flex-col justify-center items-center text-white ${currentConfig.bg}`}>
                    <currentConfig.Icon size={60} className="mb-6" />
                    <h2 className="text-3xl font-bold mb-3 text-center">{currentConfig.title}</h2>
                    <p className="text-center text-lg font-light">"{currentConfig.quote}"</p>
                </div>
                <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h3>
                    <p className="text-slate-500 mb-6">{isLogin ? `Login as a ${initialRole}.` : `Sign up as a ${initialRole}.`}</p>
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4"><p>{error}</p></div>}
                    {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md mb-4"><p>{message}</p></div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isLogin 
                            ? <LoginFields onChange={handleInputChange} /> 
                            : <SignupFields role={initialRole} formData={formData} onFileChange={handleFileChange} onInputChange={handleInputChange} fileInputRef={fileInputRef} config={currentConfig} />
                        }
                        <button type="submit" disabled={loading} className={`w-full ${currentConfig.bg} text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity`}>
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <span className="text-sm text-slate-500">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button onClick={() => setIsLogin(!isLogin)} className={`font-semibold ${currentConfig.text} hover:underline`}>
                                {isLogin ? "Sign Up" : "Login"}
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components for AuthPage ---
const LoginFields = ({ onChange }) => (
    <>
        <InputField name="identifier" type="text" placeholder="Email, Roll No, or University ID" Icon={Mail} onChange={onChange} required />
        <InputField name="password" type="password" placeholder="Password" Icon={Lock} onChange={onChange} required />
    </>
);

const SignupFields = ({ role, formData, onFileChange, onInputChange, fileInputRef, config }) => (
    <>
        {(role === 'student' || role === 'alumni') && (
            <div className="flex justify-center -mt-2 mb-4">
                <div className="relative">
                    <img src={formData.profilePicture || `https://placehold.co/128x128/e2e8f0/64748b?text=${role.charAt(0).toUpperCase()}`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4" />
                    <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md">
                        <Camera className={`w-5 h-5 ${config.text}`} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
                </div>
            </div>
        )}
        {role === 'university' ? (
            <>
                <InputField name="universityName" type="text" placeholder="University Name" Icon={Building} onChange={onInputChange} required />
                <InputField name="universityId" type="text" placeholder="University ID" Icon={Hash} onChange={onInputChange} required />
            </>
        ) : (
            <>
                <InputField name="name" type="text" placeholder="Full Name" Icon={User} onChange={onInputChange} required />
                <InputField name="email" type="email" placeholder="College Email" Icon={Mail} onChange={onInputChange} required />
                <InputField name="collegeName" type="text" placeholder="College Name" Icon={Building} onChange={onInputChange} required />
                <InputField name="rollNumber" type="text" placeholder="College Roll Number" Icon={Hash} onChange={onInputChange} required />
                <YearField name="graduatingYear" placeholder="Graduating Year" Icon={GraduationCap} onChange={onInputChange} required />
            </>
        )}
        <InputField name="password" type="password" placeholder="Password" Icon={Lock} onChange={onInputChange} required />
    </>
);

const InputField = ({ name, type, placeholder, Icon, onChange, required }) => (
    <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none"><Icon className="h-5 w-5 text-slate-400" /></span>
        <input type={type} name={name} placeholder={placeholder} onChange={onChange} required={required} className="w-full block pl-12 pr-3 py-3 border border-slate-300 rounded-lg bg-slate-50"/>
    </div>
);

const YearField = ({ name, placeholder, Icon, onChange, required }) => {
    const currentYear = new Date().getFullYear();
    
    // Generate years from 1950 to current year + 6 (for alumni from any era)
    const years = [];
    for (let year = 1950; year <= currentYear + 6; year++) {
        years.push(year);
    }
    
    return (
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none z-10">
                <Icon className="h-5 w-5 text-slate-400" />
            </span>
            <select 
                name={name} 
                onChange={onChange} 
                required={required} 
                className="w-full block pl-12 pr-3 py-3 border border-slate-300 rounded-lg bg-slate-50 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                defaultValue=""
            >
                <option value="" disabled className="text-slate-400">
                    {placeholder}
                </option>
                {years.reverse().map(year => (
                    <option key={year} value={year} className="text-slate-700">
                        {year}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
};

export default AuthPage;