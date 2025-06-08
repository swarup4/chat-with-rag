import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Replace with real user logic
const getUser = () => {
    // Example: { name: 'Admin', role: 'Admin' }
    try {
        return JSON.parse(sessionStorage.user || '{}');
    } catch {
        return {};
    }
};

export default function AdminRoute() {
    const user = getUser();
    if (!sessionStorage.auth) return <Navigate to="/login" replace />;
    if (user.role !== 'Admin') return <Navigate to="/" replace />;
    return <Outlet />;
} 