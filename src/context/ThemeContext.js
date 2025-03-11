import React, { createContext, useState, useContext, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { lightTheme, darkTheme } from "../theme";

// Create theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check if theme preference exists in localStorage
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem("themeMode");
    return savedTheme || "dark"; // Default to dark theme
  });

  // Get current theme based on mode
  const theme = themeMode === "light" ? lightTheme : darkTheme;

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);
    localStorage.setItem("themeMode", newTheme);
  };

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useThemeContext = () => useContext(ThemeContext);

export default ThemeContext;
