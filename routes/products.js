const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { auth, admin } = require("../middleware/auth");

// get all products
router.get("/", auth, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// add new product
router.post("/", auth, admin, async (req, res) => {
  try {
    const { name, brand, quantity, backupQuantity, price } = req.body;

    // Validate required fields
    if (
      !name ||
      !brand ||
      quantity == null ||
      backupQuantity == null ||
      price == null
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = new Product({
      name,
      brand,
      quantity: Number(quantity),
      backupQuantity: Number(backupQuantity),
      price: Number(price),
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(400).json({ message: error.message });
  }
});

// update product
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const { name, brand, quantity, backupQuantity, price } = req.body;

    // Validate required fields
    if (
      !name ||
      !brand ||
      quantity == null ||
      backupQuantity == null ||
      price == null
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure numeric fields are numbers
    const updateData = {
      name,
      brand,
      quantity: Number(quantity),
      backupQuantity: Number(backupQuantity),
      price: Number(price),
    };

    console.log("Updating product with data:", updateData);

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Updated product:", product);
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: error.message });
  }
});

// delete product
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message });
  }
});

// record sale
router.post("/sale", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    product.quantity -= quantity;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
