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
  const [lastChecked, setLastChecked] = useState(0);

  // check if user is authenticated - memoized with useCallback
  const checkAuth = useCallback(async () => {
    // Prevent excessive auth checks (limit to once every 5 seconds)
    const now = Date.now();
    if (now - lastChecked < 5000 && !loading) {
      return;
    }

    setLastChecked(now);
    setLoading(true);

    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      // Clear user data on auth error
      setUser(null);
      console.error("Auth check error:", err);
    } finally {
      setLoading(false);
    }
  }, [lastChecked, loading]);

  // check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // login function
  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // logout function
  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
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
  };

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
