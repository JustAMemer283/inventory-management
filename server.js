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
const connectToDatabase = async () => {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout to 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000, // Connection timeout
      heartbeatFrequencyMS: 30000, // Check server status every 30 seconds
      retryWrites: true,
      w: "majority",
      maxPoolSize: 10, // Limit connection pool size
    });
    console.log("MongoDB Atlas connected:", mongoose.connection.host);
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err);

    // Check if the error is related to IP whitelist
    if (err.message && err.message.includes("IP that isn't whitelisted")) {
      console.error(
        "IP WHITELIST ERROR: Please add your Vercel deployment IP to MongoDB Atlas whitelist"
      );
      console.error(
        "Visit: https://www.mongodb.com/docs/atlas/security-whitelist/"
      );
      console.error(
        "For Vercel deployments, you may need to allow access from anywhere (0.0.0.0/0)"
      );
    }

    return false;
  }
};

// Try to connect to the database
connectToDatabase();

// Handle MongoDB connection errors after initial connection
mongoose.connection.on("error", (err) => {
  console.error("MongoDB error after initial connection:", err);
});

// Add connection recovery logic
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected, attempting to reconnect...");
  setTimeout(() => {
    connectToDatabase();
  }, 5000); // Wait 5 seconds before reconnecting
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

// root route
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to Smoky Seven API" });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("build"));

  // Define specific routes that should be handled by the React app
  const clientRoutes = [
    "/",
    "/login",
    "/sales",
    "/inventory",
    "/transactions",
    "/home",
  ];

  // Handle specific client routes
  clientRoutes.forEach((route) => {
    app.get(route, (req, res) => {
      res.sendFile(path.resolve(__dirname, "build", "index.html"));
    });
  });

  // For any route that is not an API route, serve the index.html
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.resolve(__dirname, "build", "index.html"));
    } else {
      // If it's an API route that wasn't handled, return 404
      res.status(404).json({ message: "API endpoint not found" });
    }
  });
} else {
  // In development, still serve static files and handle client-side routing
  app.use(express.static("public"));

  // Define specific routes that should be handled by the React app
  const clientRoutes = [
    "/",
    "/login",
    "/sales",
    "/inventory",
    "/transactions",
    "/home",
  ];

  // Handle specific client routes
  clientRoutes.forEach((route) => {
    app.get(route, (req, res) => {
      res.sendFile(path.resolve(__dirname, "public", "index.html"));
    });
  });

  // basic route for API documentation in development
  app.get("/api", (req, res) => {
    res.json({ message: "Welcome to inventory management API" });
  });

  // For any other route that is not an API route, serve the index.html from public
  // This enables client-side routing in development
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.resolve(__dirname, "public", "index.html"));
    } else {
      // If it's an API route that wasn't handled, return 404
      res.status(404).json({ message: "API endpoint not found" });
    }
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
