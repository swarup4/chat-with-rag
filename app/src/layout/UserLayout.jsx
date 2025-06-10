import React from 'react';
import Layout from '../components/common/Layout';
import { Outlet } from 'react-router-dom';

const links = [
    { label: 'Q&A', to: '/dashboard' }
];

function UserLayout({ user, onLogout }) {
    return (
        <Layout user={user} onLogout={onLogout} sidebarLinks={links}>
            <main className="main-content">
                <Outlet />
            </main>
        </Layout>
    );
}

export default UserLayout;
