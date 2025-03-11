const mongoose = require("mongoose");

// transaction schema
const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["SALE", "EDIT", "DELETE", "ADD", "TRANSFER", "NEW"],
    },
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
      required: function () {
        return this.type === "SALE" || this.type === "ADD";
      },
      min: 0,
      validate: {
        validator: function (v) {
          if (this.type === "SALE") {
            return v > 0;
          }
          return v >= 0;
        },
        message: (props) => {
          if (props.value < 0) {
            return `Quantity cannot be negative`;
          }
          if (props.value === 0 && this.type === "SALE") {
            return `Sale quantity must be greater than 0`;
          }
          return `Invalid quantity`;
        },
      },
    },
    previousData: {
      type: Object,
      required: function () {
        return this.type === "EDIT";
      },
    },
    newData: {
      type: Object,
      required: function () {
        return this.type === "EDIT";
      },
    },
    remainingQuantity: {
      type: Number,
      required: function () {
        return this.type === "SALE";
      },
    },
    backupQuantity: {
      type: Number,
      required: function () {
        return this.type === "SALE";
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// create indexes for better query performance
transactionSchema.index({ product: 1, date: -1 });
transactionSchema.index({ type: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
