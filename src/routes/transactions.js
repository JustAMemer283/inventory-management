import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("product")
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
