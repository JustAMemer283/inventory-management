// Simple login test endpoint for Vercel serverless functions
// This bypasses the database to test if the API is working
const jwt = require("jsonwebtoken");

// Generate JWT token for test login
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role, isFallback: true },
    process.env.JWT_SECRET || "inventory_management_secret_key_2024",
    { expiresIn: "24h" }
  );
};

module.exports = (req, res) => {
  // Only handle POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed",
    });
  }

  try {
    const { username, password } = req.body;

    // Log the request for debugging
    console.log("Login test request received:", {
      username,
      headers: req.headers,
      method: req.method,
      url: req.url,
    });

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username and password are required",
      });
    }

    // Generate a test user ID
    const userId = "123456789";

    // Generate JWT token
    const token = generateToken(userId, "user");

    // Return a mock successful response
    return res.status(200).json({
      status: "success",
      message: "Login test successful",
      user: {
        id: userId,
        username: username,
        name: "Test User",
        role: "user",
      },
      token,
      isFallback: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Login test error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};
