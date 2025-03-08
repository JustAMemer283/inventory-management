// This file is specifically for Vercel serverless functions
// It exports the Express app from server.js

// Import the Express app from server.js
const app = require("../server.js");
const mongoose = require("mongoose");
const authFallbackRouter = require("./auth-fallback");

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Add a special route for checking MongoDB connection status
app.get("/api/db-status", (req, res) => {
  const isConnected = isMongoConnected();

  res.status(200).json({
    status: isConnected ? "connected" : "disconnected",
    readyState: mongoose.connection.readyState,
    host: isConnected ? mongoose.connection.host : null,
    message: isConnected
      ? "Database connection is active"
      : "Database is not connected. Please check MongoDB Atlas IP whitelist.",
    timestamp: new Date().toISOString(),
  });
});

// Use fallback auth routes when MongoDB is not connected
app.use("/api/auth-fallback", authFallbackRouter);

// Add a special login-test endpoint that always works
app.post("/api/login-test", (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({
      status: "error",
      message: "Username and password are required",
    });
  }

  // Return a mock successful response
  return res.status(200).json({
    status: "success",
    message: "Login test successful",
    user: {
      id: "123456789",
      username: username,
      name: "Test User",
      role: "user",
    },
    isFallback: true,
    timestamp: new Date().toISOString(),
  });
});

// Export the app as a module
module.exports = app;
