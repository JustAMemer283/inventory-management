import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["SALE", "NEW", "ADD", "EDIT", "DELETE", "TRANSFER"],
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    min: 0,
  },
  employee: {
    name: {
      type: String,
      required: true,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
  previousData: {
    type: Object,
  },
  newData: {
    type: Object,
  },
  notes: String,
  remainingQuantity: Number,
  backupQuantity: Number,
});

export default mongoose.model("Transaction", transactionSchema);
