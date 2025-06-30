import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutRedirect = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    onLogout?.();  // Run logout logic
    // Use replace: true to prevent back button going back to dashboard
    navigate('/login', { replace: true });
  }, [onLogout, navigate]);

  return null;
};

export default LogoutRedirect;