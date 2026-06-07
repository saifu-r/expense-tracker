import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
    const navigate = useNavigate();
    const { login } = useAuth(); // expose a login(user, token) method

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const user = JSON.parse(decodeURIComponent(params.get('user')));

        if (token && user) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            login(user, token); // update AuthContext state
            navigate('/');
        } else {
            navigate('/login');
        }
    }, []);

    return <p className="text-center mt-10">Signing you in...</p>;
}