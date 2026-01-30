import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Import your component files
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import AlumniDashboard from './components/AlumniDashboard';
import UniversityDashboard from './pages/UniversityDashboard';
import ManageAlumni from './pages/ManageAlumni';
import ManageStudents from './pages/ManageStudents';
import ViewFunds from './pages/ViewFunds';
import GenerateReports from './pages/GenerateReports';
import ManageStudent from './pages/ManageStudent';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// This component contains hooks that need to be within a Router context
function AppContent() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Start loading until user is verified
    const navigate = useNavigate();

    // This effect runs ONCE on app load to check for a valid token
    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // **FIXED URL**: Corrected the API endpoint for fetching user data
                    const response = await fetch(`${API_URL}/user/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData); // Success: user is logged in
                    } else {
                        localStorage.clear(); // Failure: token is invalid, clear storage
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    localStorage.clear();
                }
            }
            setIsLoading(false); // Finished checking token
        };
        verifyUser();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/');
    };

    return (
        <div className="font-sans antialiased">
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage setUser={setUser} />} />

                {/* Protected Routes Wrapper */}
                <Route element={<ProtectedRoute user={user} isLoading={isLoading} />}>
                    <Route 
                        path="/student" 
                        element={<StudentDashboard user={user} handleLogout={handleLogout} setUser={setUser} />} 
                    />
                    <Route 
                        path="/alumni" 
                        element={<AlumniDashboard user={user} handleLogout={handleLogout} setUser={setUser} />} 
                    />
                    <Route 
                        path="/university-dashboard" 
                        element={<UniversityDashboard user={user} handleLogout={handleLogout} setUser={setUser} />} 
                    />
                    <Route 
                        path="/manage-alumni" 
                        element={<ManageAlumni user={user} handleLogout={handleLogout} setUser={setUser} />} 
                    />
                    <Route 
                        path="/manage-students" 
                        element={<ManageStudents user={user} handleLogout={handleLogout} setUser={setUser} />} 
                    />
                    <Route 
                        path="/view-funds" 
                        element={<ViewFunds user={user} handleLogout={handleLogout} setUser={setUser} />} 
                    />
                    <Route 
                        path="/generate-reports" 
                        element={<GenerateReports user={user} handleLogout={handleLogout} setUser={setUser} />} 
                    />
                    <Route 
                        path="/manage-student" 
                        element={<ManageStudent user={user} handleLogout={handleLogout} setUser={setUser} />}
                    />
                </Route>
            </Routes>
        </div>
    );
}

// The main export wraps the app in the Router
export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}