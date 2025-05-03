import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  requiredRole?: string;
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  isAuthenticated, 
  requiredRole,
  children 
}) => {
  const { user, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if a specific role is required
  if (requiredRole && user) {
    if (!hasRole(requiredRole)) {
      // Redirect to dashboard if user doesn't have the required role
      return <Navigate to="/app" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;