const User = require("../models/User");

// auth middleware
const auth = async (req, res, next) => {
  try {
    // get user id from session
    const userId = req.session?.userId;
    if (!userId) {
      throw new Error();
    }

    // find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }

    // attach user to request
    req.user = user;
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
