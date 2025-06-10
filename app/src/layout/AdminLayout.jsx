import React from 'react';
import Layout from '../components/common/Layout';
import { Outlet } from 'react-router-dom';

const links = [
    { label: 'Documents', to: '/admin/documents' },
    { label: 'Users', to: '/admin/users' }
];

function AdminLayout({ user, onLogout }) {
    return (
        <Layout user={user} onLogout={onLogout} sidebarLinks={links}>
            <main className="main-content">
                <Outlet />
            </main>
        </Layout>
    );
}

export default AdminLayout;
