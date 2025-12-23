import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';
import { getRoleRedirectPath } from '../../utils/roleUtils';

/**
 * Protected Route component that checks authentication and role
 * @param {object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();
  const userRole = user?.role || user?.Role;

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // No role restrictions or user has allowed role
  if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
    return children;
  }

  // User doesn't have permission - redirect to their appropriate dashboard
  const redirectPath = getRoleRedirectPath(userRole);
  return <Navigate to={redirectPath} replace />;
}

export default ProtectedRoute;
