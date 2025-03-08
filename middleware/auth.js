const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mockDb = require("../api/mock-db");

// JWT auth middleware
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Fallback to session if no token
      if (req.session?.userId) {
        const user = await User.findById(req.session.userId);
        if (user) {
          req.user = user;
          return next();
        }
      }
      throw new Error("No authentication token");
    }

    // Extract token
    const token = authHeader.replace("Bearer ", "");

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "inventory_management_secret_key_2024"
    );

    // Find user
    let user;
    try {
      user = await User.findById(decoded.userId);
    } catch (dbError) {
      console.error("Database error in auth middleware:", dbError);

      // Try mock database if MongoDB is not available
      if (decoded.isFallback) {
        user = mockDb.findUserById(decoded.userId);
        if (user) {
          // Remove password from user object
          const { password, ...userWithoutPassword } = user;
          req.user = userWithoutPassword;
          req.isFallback = true;
          return next();
        }
      }

      throw new Error("User not found");
    }

    if (!user) {
      throw new Error("User not found");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res
      .status(401)
      .json({ message: "Please authenticate", error: error.message });
  }
};

// admin middleware
const admin = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "admin") {
        throw new Error("Not an admin");
      }
      next();
    });
  } catch (error) {
    console.error("Admin middleware error:", error.message);
    res.status(403).json({ message: "Access denied", error: error.message });
  }
};

module.exports = { auth, admin };
