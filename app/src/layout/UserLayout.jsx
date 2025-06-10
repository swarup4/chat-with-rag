import React from 'react';
import Layout from '../components/common/Layout';
import { Outlet } from 'react-router-dom';

const links = [
    { label: 'Q&A', to: '/dashboard' }
];

export default function UserLayout() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    return (
        <Layout user={user} sidebarLinks={links}>
            <main className="main-content">
                <Outlet />
            </main>
        </Layout>
    );
}
