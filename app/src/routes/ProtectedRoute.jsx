import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


export default function ProtectedRoute(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const auth = JSON.parse(sessionStorage.getItem('auth'));

    useEffect(() => {
        if (!auth) {
            setIsLoggedIn(false);
            return navigate('/');
        }

        setIsLoggedIn(true);
        if (auth.role === 'admin' && !location.pathname.startsWith('/admin')) {
            return navigate('/admin');
        }
        if (auth.role === 'user' && !location.pathname.startsWith('/dashboard')) {
            return navigate('/dashboard');
        }
    }, [auth, location, navigate, isLoggedIn]);

    return <> {isLoggedIn ? props.children : null} </>
}