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
      type: "NEW",
      product: product._id,
      employee: req.user._id,
      quantity: Number(quantity),
      newData: {
        name,
        brand,
        quantity: Number(quantity),
        backupQuantity: Number(backupQuantity),
        price: Number(price),
      },
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
    const { quantity, backupQuantity, isSwap } = req.body;

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

    let newQuantity, newBackupQuantity;

    if (isSwap) {
      // Handle swap operation
      if (quantity) {
        // Moving from backup to stock
        if (Number(quantity) > currentProduct.backupQuantity) {
          return res.status(400).json({
            message: "Cannot swap more than available backup quantity",
          });
        }
        newQuantity = Number(currentProduct.quantity) + Number(quantity);
        newBackupQuantity =
          Number(currentProduct.backupQuantity) - Number(quantity);
      } else if (backupQuantity) {
        // Moving from stock to backup
        if (Number(backupQuantity) > currentProduct.quantity) {
          return res.status(400).json({
            message: "Cannot swap more than available stock quantity",
          });
        }
        newQuantity = Number(currentProduct.quantity) - Number(backupQuantity);
        newBackupQuantity =
          Number(currentProduct.backupQuantity) + Number(backupQuantity);
      }
    } else {
      // Normal add operation
      newQuantity =
        quantity != null
          ? Number(currentProduct.quantity) + Number(quantity)
          : currentProduct.quantity;
      newBackupQuantity =
        backupQuantity != null
          ? Number(currentProduct.backupQuantity) + Number(backupQuantity)
          : currentProduct.backupQuantity;
    }

    // Update the product
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        quantity: newQuantity,
        backupQuantity: newBackupQuantity,
      },
      { new: true }
    );

    // Create transaction record with detailed notes
    let notes = "";
    if (isSwap) {
      notes = `Transferred ${quantity} units from backup to stock. (Stock: ${currentProduct.quantity} → ${newQuantity}, Backup: ${currentProduct.backupQuantity} → ${newBackupQuantity})`;
    } else {
      const stockChange = quantity
        ? `Stock: ${currentProduct.quantity} → ${newQuantity}`
        : "";
      const backupChange = backupQuantity
        ? `Backup: ${currentProduct.backupQuantity} → ${newBackupQuantity}`
        : "";
      notes = [stockChange, backupChange].filter(Boolean).join(", ");
    }

    const transaction = new Transaction({
      type: isSwap ? "TRANSFER" : "ADD",
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
      notes: notes,
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
      previousData: {
        name: product.name,
        brand: product.brand,
        quantity: product.quantity,
        backupQuantity: product.backupQuantity,
        price: product.price,
      },
      notes: `Deleted product: ${product.brand} - ${product.name} (Stock: ${
        product.quantity
      }, Backup: ${product.backupQuantity}, Price: $${product.price.toFixed(
        2
      )})`,
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

    // Check total available stock first
    const totalAvailable = product.quantity + product.backupQuantity;
    if (quantity > totalAvailable) {
      return res
        .status(400)
        .json({ message: "Not enough total stock available" });
    }

    let fromBackup = 0;
    let fromStock = 0;

    // Calculate how much to take from stock and backup
    if (quantity <= product.quantity) {
      // If we have enough in regular stock, take it all from there
      fromStock = quantity;
    } else {
      // Take what we can from stock, rest from backup
      fromStock = product.quantity;
      fromBackup = quantity - product.quantity;
    }

    // Update quantities
    product.quantity -= fromStock;
    product.backupQuantity -= fromBackup;

    await product.save();

    // Create transaction record
    const transaction = new Transaction({
      type: "SALE",
      product: product._id,
      employee: req.user._id,
      quantity: quantity,
      remainingQuantity: product.quantity,
      backupQuantity: product.backupQuantity,
      notes:
        fromBackup > 0
          ? `Sold ${quantity} units (${fromStock} from stock, ${fromBackup} from backup)`
          : `Sold ${quantity} units from stock`,
    });

    await transaction.save();
    res.json(product);
  } catch (error) {
    console.error("Error recording sale:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
