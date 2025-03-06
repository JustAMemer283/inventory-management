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
      .populate("product", "name brand")
      .populate("employee", "name")
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
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
      .populate("employee", "name");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
