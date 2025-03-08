// import required dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");

// load environment variables
dotenv.config();

// create express app
const app = express();

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://inventory-management-smoky-seven.vercel.app",
      "https://inventory-management-git-master-mccharlie-sins-projects.vercel.app",
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      /\.vercel\.app$/, // Allow all vercel.app subdomains
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(
  session({
    secret: process.env.JWT_SECRET || "inventory_management_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => {
    console.log("mongodb atlas connected:", mongoose.connection.host);
  })
  .catch((err) => {
    console.error("mongodb connection error:", err);
    // Don't crash the server on initial connection error
    // It will retry automatically
  });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on("error", (err) => {
  console.error("MongoDB error after initial connection:", err);
});

// routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("build"));

  // For any route that is not an API route, serve the index.html
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.resolve(__dirname, "build", "index.html"));
    }
  });
} else {
  // basic route for development
  app.get("/", (req, res) => {
    res.json({ message: "welcome to inventory management api" });
  });
}

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// For Vercel serverless deployment
if (process.env.VERCEL) {
  // Export the Express app as a module
  module.exports = app;
} else {
  // For local development, start the server
  const PORT = process.env.SERVER_PORT || 5000;
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
}
