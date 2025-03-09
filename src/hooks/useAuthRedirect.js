import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook to handle authentication-based redirects
 *
 * @param {Object} options - Configuration options
 * @param {string} options.redirectTo - Path to redirect to
 * @param {boolean} options.redirectIfAuthenticated - Whether to redirect if user is authenticated
 * @param {boolean} options.redirectIfUnauthenticated - Whether to redirect if user is not authenticated
 */
const useAuthRedirect = ({
  redirectTo = "/sales",
  redirectIfAuthenticated = false,
  redirectIfUnauthenticated = false,
}) => {
  const { user, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Re-check auth on direct route access
  useEffect(() => {
    if (!loading && !user && redirectIfUnauthenticated) {
      // If no user and not loading, try to check auth again
      checkAuth();
    }
  }, [loading, user, redirectIfUnauthenticated, checkAuth]);

  useEffect(() => {
    // Wait until authentication state is determined
    if (loading) return;

    // Redirect authenticated users
    if (redirectIfAuthenticated && user) {
      // Check if there's a saved location to redirect to
      const from = location.state?.from?.pathname;
      navigate(from || redirectTo, { replace: true });
    }

    // Redirect unauthenticated users
    if (redirectIfUnauthenticated && !user) {
      // Save current location for later redirect
      navigate("/login", {
        replace: true,
        state: { from: location },
      });
    }
  }, [
    user,
    loading,
    navigate,
    redirectTo,
    redirectIfAuthenticated,
    redirectIfUnauthenticated,
    location,
  ]);

  return { user, loading };
};

export default useAuthRedirect;
