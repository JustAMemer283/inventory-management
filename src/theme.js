import { createTheme } from "@mui/material";

// Dark theme configuration
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4477ff",
      light: "#6699ff",
      dark: "#3366cc",
    },
    error: {
      main: "#ff4d4d",
      light: "#ff6666",
      dark: "#cc3333",
    },
    background: {
      default: "#0a0a0a",
      paper: "#141414",
    },
    text: {
      primary: "#ffffff",
      secondary: "#999999",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#141414",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          padding: "8px 20px",
          fontWeight: 500,
          fontSize: "0.95rem",
          minWidth: "100px",
        },
        contained: {
          backgroundColor: "#4477ff",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#3366cc",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#141414",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#1a1a1a",
            borderRadius: 8,
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.1)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#4477ff",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#141414",
          backgroundImage: "none",
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.1rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
});

// Light theme configuration
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#3b82f6",
      dark: "#1d4ed8",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          color: "#1e293b",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          padding: "8px 20px",
          fontWeight: 500,
          fontSize: "0.95rem",
          minWidth: "100px",
        },
        contained: {
          backgroundColor: "#2563eb",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#1d4ed8",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderLeft: "1px solid rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#ffffff",
            borderRadius: 8,
            "& fieldset": {
              borderColor: "rgba(0, 0, 0, 0.1)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(0, 0, 0, 0.2)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2563eb",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          backgroundImage: "none",
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2rem",
      fontWeight: 600,
      color: "#1e293b",
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 600,
      color: "#1e293b",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: "#1e293b",
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: "#1e293b",
    },
    h5: {
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#1e293b",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      color: "#1e293b",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
});

// Default export for backward compatibility
export default darkTheme;
