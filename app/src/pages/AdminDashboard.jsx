import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="space-y-4">
                <Link to="/admin/users" className="block bg-indigo-600 text-white px-6 py-3 rounded shadow hover:bg-indigo-700">User Management</Link>
                <Link to="/admin/roles" className="block bg-indigo-600 text-white px-6 py-3 rounded shadow hover:bg-indigo-700">Role Assignment</Link>
            </div>
        </div>
    );
} 