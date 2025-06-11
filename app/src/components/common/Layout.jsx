import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Footer() {
    return (
        <footer className="bg-cyan-700 text-white text-center py-2 mt-8">
            &copy; {new Date().getFullYear()} GenAI App. All rights reserved.
        </footer>
    );
}

export default function Layout({ user, sidebarLinks }) {

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar user={user} />
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