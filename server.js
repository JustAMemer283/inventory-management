// import required dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");

// load environment variables
dotenv.config();

// create express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("mongodb atlas connected:", mongoose.connection.host);
  })
  .catch((err) => {
    console.error("mongodb connection error:", err);
  });

// routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// basic route
app.get("/", (req, res) => {
  res.json({ message: "welcome to inventory management api" });
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server is running on port", PORT);
});
