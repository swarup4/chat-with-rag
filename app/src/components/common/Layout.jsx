import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';

function getUser() {
    try {
        return JSON.parse(sessionStorage.user || 'null');
    } catch {
        return null;
    }
}

function Sidebar({ user }) {
    const location = useLocation();
    const links = [
        { to: '/', label: 'Home' },
        { to: '/documents', label: 'Documents' },
        { to: '/qa', label: 'Q&A' },
    ];
    if (user?.role === 'Admin') {
        links.push({ to: '/admin', label: 'Admin' });
    }
    return (
        <aside className="w-48 bg-indigo-100 min-h-screen p-4 hidden md:block">
            <nav className="flex flex-col gap-2">
                {links.map(link => (
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

function Footer() {
    return (
        <footer className="bg-indigo-700 text-white text-center py-2 mt-8">
            &copy; {new Date().getFullYear()} GenAI App. All rights reserved.
        </footer>
    );
}

export default function Layout() {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(getUser());

    function handleLogout() {
        sessionStorage.clear();
        setUser(null);
        navigate('/login');
    }

    React.useEffect(() => {
        setUser(getUser());
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar user={user} onLogout={handleLogout} />
            <div className="flex flex-1">
                <Sidebar user={user} />
                <main className="flex-1 pt-4 px-4">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
} 