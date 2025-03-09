const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const { auth } = require("../middleware/auth");

// get all transactions with filters
router.get("/", auth, async (req, res) => {
  try {
    const { employee, product, startDate, endDate } = req.query;
    const query = {};

    // apply filters
    if (employee) query.employee = employee;
    if (product) query.product = product;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate({
        path: "product",
        select: "name brand",
        // Handle deleted products by using the stored data
        transform: (doc) => {
          if (!doc) {
            // If product is deleted, return null but let the frontend handle it
            return null;
          }
          return doc;
        },
      })
      .populate({
        path: "employee",
        select: "name",
        // Handle deleted employees
        transform: (doc) => {
          if (!doc) {
            // If employee is deleted, return a placeholder
            return { name: "Deleted User" };
          }
          return doc;
        },
      })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// create new transaction
router.post("/", auth, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      employee: req.user._id,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// get transaction by id
router.get("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("product", "name brand")
      .populate({
        path: "employee",
        select: "name",
        // Handle deleted employees
        transform: (doc) => {
          if (!doc) {
            // If employee is deleted, return a placeholder
            return { name: "Deleted User" };
          }
          return doc;
        },
      });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// delete transactions older than specified days
router.delete("/older-than/:days", auth, async (req, res) => {
  try {
    const days = parseInt(req.params.days);

    if (isNaN(days) || days < 1) {
      return res.status(400).json({ message: "Invalid number of days" });
    }

    // Calculate the date threshold (current date minus specified days)
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Delete transactions older than the threshold
    const result = await Transaction.deleteMany({
      date: { $lt: dateThreshold },
    });

    res.json({
      message: `Successfully deleted ${result.deletedCount} transactions older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
