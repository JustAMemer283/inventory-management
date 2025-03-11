import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../services/api";

// create auth context
const AuthContext = createContext(null);

// auth provider component
export const AuthProvider = ({ children }) => {
  // state management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // check if user is authenticated - memoized with useCallback
  const checkAuth = useCallback(async () => {
    if (!initialized) {
      setLoading(true);
      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (err) {
        // Only clear user data if it's an authentication error
        if (err.response && err.response.status === 401) {
          setUser(null);
        }
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    }
  }, [initialized]);

  // check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);
      setUser(response.user);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authApi.logout();
      setUser(null);
      setError(null);
      setInitialized(false); // Reset initialization state
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // value object for context
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    initialized,
  };

  // Don't render children until initial auth check is complete
  if (!initialized && loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
