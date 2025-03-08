import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useAuthRedirect from "../hooks/useAuthRedirect";

// login page component
const Login = () => {
  // state management
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // get navigate function from router and auth context
  const navigate = useNavigate();
  const { login } = useAuth();

  // Redirect if already authenticated
  useAuthRedirect({
    redirectTo: "/sales",
    redirectIfAuthenticated: true,
  });

  // handle form input change
  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  // handle form submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // validate form
      if (!formData.username || !formData.password) {
        throw new Error("Please fill in all fields");
      }

      // attempt login using auth context
      const response = await login(formData);

      // always redirect to sales page
      navigate("/sales");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "background.paper",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 600,
              background: "linear-gradient(45deg, #fff, #999)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Inventory Management
          </Typography>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            gutterBottom
            sx={{ mb: 3 }}
          >
            Please login to continue
          </Typography>

          {/* error alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                width: "100%",
                mb: 2,
                backgroundColor: "rgba(255, 70, 70, 0.1)",
                color: "error.main",
                border: "1px solid rgba(255, 70, 70, 0.3)",
                "& .MuiAlert-icon": {
                  color: "error.main",
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* login form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              label="Username"
              value={formData.username}
              onChange={handleInputChange("username")}
              fullWidth
              required
              margin="normal"
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange("password")}
              fullWidth
              required
              margin="normal"
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                backgroundColor: "primary.main",
                color: "background.default",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {loading ? (
                <CircularProgress
                  size={24}
                  sx={{ color: "background.default" }}
                />
              ) : (
                "Login"
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
