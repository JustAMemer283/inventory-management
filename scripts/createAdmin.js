require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // create admin user
    const adminUser = new User({
      username: "admin",
      password: "admin123",
      name: "Admin User",
      role: "admin",
    });

    try {
      await adminUser.save();
      console.log("Admin user created successfully");
    } catch (error) {
      console.error("Error creating admin user:", error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
