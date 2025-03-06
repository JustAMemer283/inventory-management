import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import TransactionHistory from "./pages/TransactionHistory";
import theme from "./theme";

// app component
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <AuthProvider>
          <Router>
            <Navigation />
            <Box sx={{ p: 3 }}>
              <Routes>
                {/* public routes */}
                <Route path="/login" element={<Login />} />

                {/* protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute adminOnly>
                      <Inventory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sales"
                  element={
                    <ProtectedRoute>
                      <Sales />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <TransactionHistory />
                    </ProtectedRoute>
                  }
                />

                {/* catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Router>
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
};

export default App;
