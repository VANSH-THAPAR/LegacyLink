import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ user, isLoading }) => {
    // While checking for token, show a loading indicator
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // If loading is finished and there's no user, redirect to auth page
    return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;