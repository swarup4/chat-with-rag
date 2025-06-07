import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/user/Login';
import Signup from './components/user/Signup';
import './App.scss';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
