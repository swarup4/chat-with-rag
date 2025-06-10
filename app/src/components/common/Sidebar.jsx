import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Sidebar({ sidebarLinks = [] }) {
    const location = useLocation();
    return (
        <aside className="w-48 bg-cyan-100 min-h-screen p-4 hidden md:block">
            <nav className="flex flex-col gap-2">
                {sidebarLinks.map((link, index) => (
                    <Link
                        key={index}
                        to={link.to}
                        className={`px-3 py-2 rounded hover:bg-cyan-200 font-medium ${location.pathname === link.to ? 'bg-cyan-200 text-cyan-900' : 'text-cyan-700'}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
