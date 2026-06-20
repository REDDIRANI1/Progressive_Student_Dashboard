import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'MENTOR' ? '/mentor' : '/dashboard'} replace />;
  }

  return children;
};
