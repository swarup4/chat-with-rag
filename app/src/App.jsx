import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/user/Login';
import Signup from './components/user/Signup';
import './App.scss';

function App() {
	const router = createBrowserRouter([
		{
			path: '/',
			element: <Login />,
		}, {
			path: '/signup',
			element: <Signup />,
		},
	]);
  
	return (
		<RouterProvider router={router} />
	);
}

export default App;
