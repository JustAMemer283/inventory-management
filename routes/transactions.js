const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const { auth } = require("../middleware/auth");

// get all transactions with filters
router.get("/", auth, async (req, res) => {
  try {
    const { employee, product, startDate, endDate } = req.query;

    // build query
    const query = {};

    if (employee) {
      query.employee = employee;
    }

    if (product) {
      query.product = product;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // get transactions with populated fields
    const transactions = await Transaction.find(query)
      .populate("product", "name brand")
      .populate("employee", "name")
      .sort({ timestamp: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// record sale
router.post("/", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // check if enough stock
    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    // create transaction
    const transaction = new Transaction({
      product: productId,
      employee: req.user._id,
      quantity,
    });

    await transaction.save();

    // update product quantity
    product.quantity -= quantity;
    await product.save();

    // get populated transaction
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("product", "name brand")
      .populate("employee", "name");

    res.status(201).json(populatedTransaction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
