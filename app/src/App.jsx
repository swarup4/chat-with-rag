import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/user/Login';
import logo from './logo.svg';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
