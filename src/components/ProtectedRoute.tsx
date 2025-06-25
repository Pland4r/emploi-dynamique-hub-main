import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  userType?: 'candidate' | 'recruiter';
}

const ProtectedRoute = ({ children, userType }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log('ProtectedRoute - isLoading:', isLoading);
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - expected userType:', userType);

  if (isLoading) {
    console.log('ProtectedRoute - Still loading, returning null.');
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  if (userType && user?.role !== userType) {
    console.log(`ProtectedRoute - Unauthorized role: User role is ${user?.role}, but expected ${userType}. Redirecting to home.`);
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - User is authorized, rendering children.');
  return <>{children}</>;
};

export default ProtectedRoute;
