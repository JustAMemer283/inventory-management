import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
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

// Dynamic route handler component
const DynamicRouteHandler = () => {
  const { slug } = useParams();

  // Determine which component to render based on the slug
  // This is a simple implementation - you may need to adjust based on your actual requirements
  switch (slug) {
    case "inventory":
      return <Inventory />;
    case "sales":
      return <Sales />;
    case "transactions":
      return <TransactionHistory />;
    case "home":
      return <Home />;
    default:
      return <Navigate to="/sales" replace />;
  }
};

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
                {/* public routes - Login component has internal redirect logic */}
                <Route path="/login" element={<Login />} />

                {/* protected routes */}
                <Route path="/" element={<Navigate to="/sales" replace />} />
                <Route
                  path="/home"
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

                {/* Dynamic route handler for direct URL access */}
                <Route
                  path="/:slug"
                  element={
                    <ProtectedRoute>
                      <DynamicRouteHandler />
                    </ProtectedRoute>
                  }
                />

                {/* catch all route */}
                <Route path="*" element={<Navigate to="/sales" replace />} />
              </Routes>
            </Box>
          </Router>
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
};

export default App;
