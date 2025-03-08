import express from "express";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();

    // Record transaction
    const transaction = new Transaction({
      type: "NEW",
      product: savedProduct._id,
      employee: { name: req.body.employee || "Admin" },
      newData: savedProduct,
    });
    await transaction.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const previousData = { ...product.toObject() };
    Object.assign(product, req.body);
    const updatedProduct = await product.save();

    // Record transaction
    const transaction = new Transaction({
      type: "EDIT",
      product: product._id,
      employee: { name: req.body.employee || "Admin" },
      previousData,
      newData: updatedProduct,
    });
    await transaction.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update stock
router.put("/:id/stock", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const previousData = { ...product.toObject() };
    product.quantity = req.body.quantity || product.quantity;
    product.backupQuantity = req.body.backupQuantity || product.backupQuantity;
    const updatedProduct = await product.save();

    // Record transaction
    const transaction = new Transaction({
      type: "ADD",
      product: product._id,
      employee: { name: req.body.employee || "Admin" },
      previousData,
      newData: updatedProduct,
    });
    await transaction.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Record sale
router.post("/sale", async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const quantity = Number(req.body.quantity);
    const totalAvailable = product.quantity + product.backupQuantity;

    if (quantity > totalAvailable) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const previousData = { ...product.toObject() };

    // Deduct from main stock first, then backup if needed
    if (quantity <= product.quantity) {
      product.quantity -= quantity;
    } else {
      const remainingQuantity = quantity - product.quantity;
      product.quantity = 0;
      product.backupQuantity -= remainingQuantity;
    }

    const updatedProduct = await product.save();

    // Record transaction
    const transaction = new Transaction({
      type: "SALE",
      product: product._id,
      quantity,
      employee: { name: req.body.employee || "Admin" },
      date: req.body.date || new Date(),
      previousData,
      newData: updatedProduct,
      remainingQuantity: updatedProduct.quantity,
      backupQuantity: updatedProduct.backupQuantity,
    });
    await transaction.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const previousData = { ...product.toObject() };
    await product.deleteOne();

    // Record transaction
    const transaction = new Transaction({
      type: "DELETE",
      product: product._id,
      employee: { name: req.body.employee || "Admin" },
      previousData,
      notes: `Deleted: ${product.brand}: ${product.name}`,
    });
    await transaction.save();

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
