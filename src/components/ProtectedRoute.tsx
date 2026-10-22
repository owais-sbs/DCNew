import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: string;
  fallbackPath?: string;
}

export default function ProtectedRoute({ children, allowedRole, fallbackPath = "/dashboard" }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role?.toLowerCase() !== allowedRole.toLowerCase()) {
    const destination = user?.role?.toLowerCase() === "student" ? "/student/dashboard" : fallbackPath;
    return <Navigate to={destination} replace />;
  }

  return children;
}
