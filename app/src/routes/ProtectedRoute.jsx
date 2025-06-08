import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Replace with real auth logic
const isAuthenticated = () => !!sessionStorage.auth;

export default function ProtectedRoute() {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
} 