import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
    return (
        <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button className="md:hidden mr-2" aria-label="Open sidebar">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <Link to="/" className="font-bold text-lg">GenAI App</Link>
                <Link to="/documents" className="hover:underline">Documents</Link>
                <Link to="/qa" className="hover:underline">Q&A</Link>
                {user?.role === 'Admin' && (
                    <Link to="/admin" className="hover:underline">Admin</Link>
                )}
            </div>
            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="bg-indigo-900 rounded-full px-3 py-1 text-sm font-semibold">
                            {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                        </span>
                        <button onClick={onLogout} className="ml-2 bg-white text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100">Logout</button>
                    </>
                ) : (
                    <Link to="/login" className="bg-white text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100">Login</Link>
                )}
            </div>
        </nav>
    );
} 