const Product = require("../../models/Product");

// get all products
const getAllProducts = async () => {
  try {
    const products = await Product.find();
    return products;
  } catch (error) {
    throw new Error(`error fetching products: ${error.message}`);
  }
};

// add new product
const addProduct = async (productData) => {
  try {
    const product = new Product(productData);
    await product.save();
    return product;
  } catch (error) {
    throw new Error(`error adding product: ${error.message}`);
  }
};

// update product
const updateProduct = async (id, productData) => {
  try {
    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
    });
    return product;
  } catch (error) {
    throw new Error(`error updating product: ${error.message}`);
  }
};

// delete product
const deleteProduct = async (id) => {
  try {
    await Product.findByIdAndDelete(id);
    return { message: "product deleted successfully" };
  } catch (error) {
    throw new Error(`error deleting product: ${error.message}`);
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
