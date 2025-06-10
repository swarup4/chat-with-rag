import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Sidebar({ sidebarLinks = [] }) {
    const location = useLocation();
    return (
        <aside className="w-48 bg-indigo-100 min-h-screen p-4 hidden md:block">
            <nav className="flex flex-col gap-2">
                {sidebarLinks.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`px-3 py-2 rounded hover:bg-indigo-200 font-medium ${location.pathname === link.to ? 'bg-indigo-200 text-indigo-900' : 'text-indigo-700'}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
