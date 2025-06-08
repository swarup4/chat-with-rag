import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserList from './components/admin/UserList';
import RoleAssign from './components/admin/RoleAssign';
import DocumentManagement from './pages/DocumentManagement';
import QAPage from './pages/QAPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import Layout from './components/common/Layout';
import './App.scss';

function App() {
	const router = createBrowserRouter([
		{
			element: <Layout />,
			children: [
				{
					path: '/',
					element: <Login />,
				},
				{
					path: '/signup',
					element: <Signup />,
				},
				{
					element: <ProtectedRoute />,
					children: [
						{
							path: '/documents',
							element: <DocumentManagement />,
						},
						{
							path: '/qa',
							element: <QAPage />,
						},
					],
				},
				{
					element: <AdminRoute />,
					children: [
						{
							path: '/admin',
							element: <AdminDashboard />,
						},
						{
							path: '/admin/users',
							element: <UserList />,
						},
						{
							path: '/admin/roles',
							element: <RoleAssign />,
						},
					],
				},
			],
		},
	]);
  
	return (
		<RouterProvider router={router} />
	);
}

export default App;
