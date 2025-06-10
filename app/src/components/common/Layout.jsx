import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Footer() {
    return (
        <footer className="bg-cyan-700 text-white text-center py-2 mt-8">
            &copy; {new Date().getFullYear()} GenAI App. All rights reserved.
        </footer>
    );
}

export default function Layout({ user, onLogout, sidebarLinks }) {
    const navigate = useNavigate();

    function handleLogout() {
        if (onLogout) {
            onLogout();
        } else {
            sessionStorage.clear();
            navigate('/');
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar user={user} onLogout={handleLogout} />
            <div className="flex flex-1">
                <Sidebar sidebarLinks={sidebarLinks} />
                <main className="flex-1 pt-4 px-4">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
}