const jwt = require("jsonwebtoken");
const User = require("../models/User");

// auth middleware
const auth = async (req, res, next) => {
  try {
    // get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    // attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

// admin middleware
const admin = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "admin") {
        throw new Error();
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ message: "Access denied" });
  }
};

module.exports = { auth, admin };
