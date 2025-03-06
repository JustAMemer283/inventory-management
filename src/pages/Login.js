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
import { authApi } from "../services/api";

// login page component
const Login = () => {
  // state management
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // get navigate function from router
  const navigate = useNavigate();

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

      // attempt login
      const response = await authApi.login(formData);

      // store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // redirect based on role
      if (response.user.role === "admin") {
        navigate("/inventory");
      } else {
        navigate("/sales");
      }
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
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Inventory Management
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Please login to continue
          </Typography>

          {/* error alert */}
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* login form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: "100%", mt: 2 }}
          >
            <TextField
              label="Username"
              value={formData.username}
              onChange={handleInputChange("username")}
              fullWidth
              required
              margin="normal"
              disabled={loading}
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
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Login"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
