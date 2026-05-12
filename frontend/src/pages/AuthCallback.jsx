import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This page handles the Google OAuth redirect
// Google sends the token in the URL like: /auth/callback?token=eyJ...
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      login(token, { id: payload.id, name: payload.name, email: payload.email });
      navigate('/');
    } else {
      navigate('/login');
    }
  }, []);

  return <div style={{ padding: '40px', textAlign: 'center' }}>Logging you in...</div>;
};

export default AuthCallback;
