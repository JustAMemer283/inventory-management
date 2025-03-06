const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
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

    // Create transaction record
    const transaction = new Transaction({
      type: "ADD",
      product: product._id,
      employee: req.user._id,
      quantity: Number(quantity),
      notes: `Initial stock: ${quantity} units, Backup: ${backupQuantity} units`,
    });

    await transaction.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(400).json({ message: error.message });
  }
});

// update stock
router.put("/:id/stock", auth, admin, async (req, res) => {
  try {
    const { quantity, backupQuantity } = req.body;

    // Validate quantity fields
    if (quantity == null && backupQuantity == null) {
      return res
        .status(400)
        .json({ message: "At least one quantity field is required" });
    }

    // Get the current product data
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate new quantities
    const newQuantity =
      quantity != null
        ? Number(currentProduct.quantity) + Number(quantity)
        : currentProduct.quantity;
    const newBackupQuantity =
      backupQuantity != null
        ? Number(currentProduct.backupQuantity) + Number(backupQuantity)
        : currentProduct.backupQuantity;

    // Update the product
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        quantity: newQuantity,
        backupQuantity: newBackupQuantity,
      },
      { new: true }
    );

    // Create transaction record
    const transaction = new Transaction({
      type: "ADD",
      product: product._id,
      employee: req.user._id,
      quantity: quantity || backupQuantity,
      previousData: {
        quantity: currentProduct.quantity,
        backupQuantity: currentProduct.backupQuantity,
      },
      newData: {
        quantity: newQuantity,
        backupQuantity: newBackupQuantity,
      },
      notes: "Stock update",
    });

    await transaction.save();
    res.json(product);
  } catch (error) {
    console.error("Error updating stock:", error);
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

    // Get the current product data
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prepare update data
    const updateData = {
      name,
      brand,
      quantity: Number(quantity),
      backupQuantity: Number(backupQuantity),
      price: Number(price),
    };

    // Update the product
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Create transaction record
    const transaction = new Transaction({
      type: "EDIT",
      product: product._id,
      employee: req.user._id,
      previousData: {
        name: currentProduct.name,
        brand: currentProduct.brand,
        quantity: currentProduct.quantity,
        backupQuantity: currentProduct.backupQuantity,
        price: currentProduct.price,
      },
      newData: updateData,
      notes: "Product details updated",
    });

    await transaction.save();
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: error.message });
  }
});

// delete product
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create transaction record before deleting
    const transaction = new Transaction({
      type: "DELETE",
      product: product._id,
      employee: req.user._id,
      notes: `Deleted product: ${product.name}`,
    });

    await transaction.save();
    await Product.findByIdAndDelete(req.params.id);

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

    const previousQuantity = product.quantity;
    product.quantity -= quantity;
    await product.save();

    // Create transaction record
    const transaction = new Transaction({
      type: "SALE",
      product: product._id,
      employee: req.user._id,
      quantity: quantity,
      remainingQuantity: product.quantity,
      backupQuantity: product.backupQuantity,
      notes: `Sold ${quantity} units`,
    });

    await transaction.save();
    res.json(product);
  } catch (error) {
    console.error("Error recording sale:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
