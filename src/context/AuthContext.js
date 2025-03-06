import React, { createContext, useState, useContext, useEffect } from "react";
import { authApi } from "../services/api";

// create auth context
const AuthContext = createContext(null);

// auth provider component
export const AuthProvider = ({ children }) => {
  // state management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // check if user is authenticated
  const checkAuth = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // login function
  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
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
