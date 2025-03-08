const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { auth, admin } = require("../middleware/auth");

// login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Set a timeout for the database operation
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database operation timed out")), 5000)
    );

    // find user with timeout
    let user;
    try {
      user = await Promise.race([
        User.findOne({ username }).lean().exec(),
        timeoutPromise,
      ]);
    } catch (error) {
      console.error("User lookup timeout:", error);
      return res
        .status(504)
        .json({ message: "Login request timed out. Please try again." });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // check password with timeout
    let isMatch;
    try {
      isMatch = await Promise.race([
        bcrypt.compare(password, user.password),
        timeoutPromise,
      ]);
    } catch (error) {
      console.error("Password comparison timeout:", error);
      return res
        .status(504)
        .json({ message: "Login request timed out. Please try again." });
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // set user session
    req.session.userId = user._id;

    // send response
    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
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
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
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

module.exports = router;
