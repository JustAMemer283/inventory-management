const mongoose = require("mongoose");

// transaction schema
const transactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  },
  {
    timestamps: true,
  }
);

// create indexes for better query performance
transactionSchema.index({ product: 1, timestamp: -1 });
transactionSchema.index({ employee: 1, timestamp: -1 });
transactionSchema.index({ timestamp: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
