import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PostLoginRedirect = ({ role }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (role === 'hr') {
      navigate('/hrdashboard', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  }, [role, navigate]);
  return null;
};

export default PostLoginRedirect; 