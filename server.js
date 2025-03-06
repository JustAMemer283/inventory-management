// import required dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/utils/db");
const productRoutes = require("./src/routes/productRoutes");

// load environment variables
dotenv.config();

// create express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect to mongodb atlas
connectDB();

// routes
app.use("/api/products", productRoutes);

// basic route
app.get("/", (req, res) => {
  res.json({ message: "welcome to inventory management api" });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
