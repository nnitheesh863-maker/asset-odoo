import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ProtectedRoute({ children, isAuthenticated, requiredRole, userRole }) {
  if (isAuthenticated === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
