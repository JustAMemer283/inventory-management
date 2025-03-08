// Fallback authentication endpoint for when MongoDB is not available
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mockDb = require("./mock-db");

const router = express.Router();

// Generate JWT token for fallback auth
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role, isFallback: true },
    process.env.JWT_SECRET || "inventory_management_secret_key_2024",
    { expiresIn: "24h" }
  );
};

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find user in mock database
    const user = mockDb.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Set user session
    if (req.session) {
      req.session.userId = user._id;
    }

    // Send response
    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      token,
      message: "Logged in using fallback authentication (MongoDB unavailable)",
      isFallback: true,
    });
  } catch (error) {
    console.error("Fallback login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user
router.get("/me", (req, res) => {
  try {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      try {
        // Verify token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "inventory_management_secret_key_2024"
        );

        // If it's a fallback token, use mock database
        if (decoded.isFallback) {
          const user = mockDb.findUserById(decoded.userId);
          if (user) {
            // Remove password from response
            const { password, ...userWithoutPassword } = user;

            // Generate a fresh token
            const newToken = generateToken(user._id, user.role);

            // Send response
            return res.json({
              ...userWithoutPassword,
              token: newToken,
              message: "Using fallback authentication (MongoDB unavailable)",
              isFallback: true,
            });
          }
        }
      } catch (tokenError) {
        console.error("Token verification error:", tokenError);
      }
    }

    // Fallback to session if no valid token
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Please authenticate" });
    }

    // Find user in mock database
    const user = mockDb.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Generate a fresh token
    const token = generateToken(user._id, user.role);

    // Send response
    res.json({
      ...userWithoutPassword,
      token,
      message: "Using fallback authentication (MongoDB unavailable)",
      isFallback: true,
    });
  } catch (error) {
    console.error("Fallback getCurrentUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  } else {
    res.json({ message: "No session to destroy" });
  }
});

module.exports = router;
