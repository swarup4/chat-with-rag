import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserList from './components/admin/UserList';
import RoleAssign from './components/admin/RoleAssign';
import DocumentManagement from './pages/DocumentManagement';
import QAPage from './pages/QAPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layout/AdminLayout';
import UserLayout from './layout/UserLayout';
import './App.scss';

function App() {
    const router = createBrowserRouter([
        {
            path: '',
            element: <Login />,
        }, {
            path: 'signup',
            element: <Signup />,
        }, {
            path: 'dashboard',
            element: <UserLayout />,
            children: [{
                // path: '',
                // element: <ProtectedRoute><Outlet /></ProtectedRoute>,
                // children: [{
                    path: '',
                    element: <QAPage />,
                // }]
            }]
        }, {
            path: 'admin',
            element: <AdminLayout />,
            children: [{
                // path: '',
                // element: <ProtectedRoute><Outlet /></ProtectedRoute>,
                // children: [{
                    path: '',
                    element: <AdminDashboard />,
                }, {
                    path: 'documents',
                    element: <DocumentManagement />,
                }, {
                    path: 'users',
                    element: <UserList />,
                }, {
                    path: 'roles',
                    element: <RoleAssign />,
                // }]
            }]
        }
    ]);

    return (
        <RouterProvider router={router} />
    );
}

export default App;
