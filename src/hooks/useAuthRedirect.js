import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until authentication state is determined
    if (loading) return;

    // Redirect authenticated users
    if (redirectIfAuthenticated && user) {
      navigate(redirectTo, { replace: true });
    }

    // Redirect unauthenticated users
    if (redirectIfUnauthenticated && !user) {
      navigate("/login", { replace: true });
    }
  }, [
    user,
    loading,
    navigate,
    redirectTo,
    redirectIfAuthenticated,
    redirectIfUnauthenticated,
  ]);

  return { user, loading };
};

export default useAuthRedirect;
