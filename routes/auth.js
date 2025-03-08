const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth, admin } = require("../middleware/auth");

// Generate JWT token
const generateToken = (userId, role, isFallback = false) => {
  return jwt.sign(
    { userId, role, isFallback },
    process.env.JWT_SECRET || "inventory_management_secret_key_2024",
    { expiresIn: "24h" }
  );
};

// login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // set user session (for backward compatibility)
    req.session.userId = user._id;

    // send response with token
    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// logout route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// get current user
router.get("/me", auth, async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;

    // Generate a fresh token to extend the session
    const token = generateToken(user._id, user.role, req.isFallback);

    // Return user data and fresh token
    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      token,
      isFallback: req.isFallback || false,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// create user (admin only)
router.post("/users", auth, admin, async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    // check if username exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // create user
    const user = new User({
      username,
      password,
      name,
      role,
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// get all users (admin only)
router.get("/users", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// update user (admin only)
router.put("/users/:id", auth, admin, async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.role = role;

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// delete user (admin only)
router.delete("/users/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.remove();

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// verify password route
router.post("/verify-password", auth, async (req, res) => {
  try {
    const { password } = req.body;

    // Get the user from the request (added by auth middleware)
    const user = req.user;

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Password is correct
    res.json({ success: true });
  } catch (error) {
    console.error("Password verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
