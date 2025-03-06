const mongoose = require("mongoose");

// define transaction schema
const transactionSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// create indexes for better query performance
transactionSchema.index({ employee: 1, timestamp: -1 });
transactionSchema.index({ product: 1, timestamp: -1 });
transactionSchema.index({ timestamp: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
