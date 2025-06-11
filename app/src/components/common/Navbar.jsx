import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    function logout() {
        sessionStorage.removeItem('user');
        navigate('/')
    }

    return (
        <nav className="bg-cyan-700 text-white px-6 py-3 flex items-center justify-between">
            
            <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                    
                    <span className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-cyan-700 font-extrabold text-xl">G</span>
                    <span>GenAI App</span>
                </Link>
            </div>
            
            <div className="relative flex items-center" ref={dropdownRef}>
                {user ? (
                    <>
                        <span className="mr-2 text-sm font-semibold hidden sm:inline-block">
                            {user.name || 'User'}
                        </span>
                        
                        <button
                            className="p-1 rounded-full hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={() => setDropdownOpen((open) => !open)}
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                        >
                            <span className="flex items-center justify-center w-8 h-8 bg-cyan-900 rounded-full text-white font-bold">
                                {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                            </span>
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white text-cyan-700 rounded shadow-lg z-10">
                                <button
                                    onClick={() => { setDropdownOpen(false); logout(); }}
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