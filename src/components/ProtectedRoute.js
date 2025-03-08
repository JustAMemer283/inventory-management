import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // show loading state
  if (loading) {
    return null;
  }

  // redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // redirect to sales if admin access required but user is not admin
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/sales" replace />;
  }

  // render children if authenticated and authorized
  return children;
};

export default ProtectedRoute;
