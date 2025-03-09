import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CircularProgress, Box } from "@mui/material";

// protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, checkAuth } = useAuth();
  const location = useLocation();

  // Re-check auth on direct route access
  useEffect(() => {
    if (!user && !loading) {
      // If no user and not loading, try to check auth again
      // This helps with direct URL access
      checkAuth();
    }
  }, [user, loading, checkAuth]);

  // show loading state with spinner
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
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
