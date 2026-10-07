import { Navigate, useLocation } from 'react-router-dom';
import { getSession } from '../services/authService';

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = session.user?.roles || [];
    const hasRole = allowedRoles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{ from: location.pathname, allowedRoles, currentRoles: userRoles }}
        />
      );
    }
  }

  return children;
}

