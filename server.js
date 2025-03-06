// import required dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

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
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.error("mongodb connection error:", err));

// basic route
app.get("/", (req, res) => {
  res.json({ message: "welcome to inventory management api" });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
