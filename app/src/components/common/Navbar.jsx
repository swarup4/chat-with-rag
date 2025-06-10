import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();

    return (
        <nav className="bg-cyan-700 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <Link to="/" className="font-bold text-lg">GenAI App</Link>
                
            </div>
            <div className="relative flex items-center">
                {user ? (
                    <>
                        <span className="flex items-center gap-2 bg-cyan-900 rounded-full px-3 py-1 text-sm font-semibold">
                            {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                        </span>
                        <button
                            className="ml-2 p-1 rounded-full hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={() => setDropdownOpen((open) => !open)}
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white text-cyan-700 rounded shadow-lg z-10">
                                <div className="px-4 py-2 border-b border-cyan-100 text-sm">{user.name || 'User'}</div>
                                <button
                                    onClick={() => { setDropdownOpen(false); onLogout(); }}
                                    className="w-full text-left px-4 py-2 hover:bg-cyan-100 text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <Link to="/" className="bg-white text-cyan-700 px-3 py-1 rounded hover:bg-cyan-100">Login</Link>
                )}
            </div>
        </nav>
    );
}