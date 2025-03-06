const mongoose = require("mongoose");

// define product schema
const productSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  backupQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// update the updatedAt timestamp before saving
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Product", productSchema);
