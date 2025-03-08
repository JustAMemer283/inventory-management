// Mock database service for when MongoDB is not available
// This provides basic functionality for testing and development

// Mock user data
const users = [
  {
    _id: "1",
    username: "admin",
    name: "Admin User",
    role: "admin",
    // Password: admin123 (don't use this in production!)
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC",
  },
  {
    _id: "2",
    username: "user",
    name: "Regular User",
    role: "user",
    // Password: user123 (don't use this in production!)
    password: "$2a$10$8MhLtO8WXSKjVS0Y4MdCF.qbu0aCH7t1TA9RpJDVTtRDX85feBdHe",
  },
];

// Mock product data
const products = [
  {
    _id: "1",
    name: "Laptop",
    brand: "TechBrand",
    quantity: 10,
    backupQuantity: 5,
    price: 999.99,
  },
  {
    _id: "2",
    name: "Smartphone",
    brand: "MobileTech",
    quantity: 20,
    backupQuantity: 10,
    price: 499.99,
  },
  {
    _id: "3",
    name: "Headphones",
    brand: "AudioTech",
    quantity: 30,
    backupQuantity: 15,
    price: 99.99,
  },
];

// Mock transactions
const transactions = [
  {
    _id: "1",
    type: "NEW",
    product: "1",
    employee: "1",
    quantity: 15,
    date: new Date("2023-01-01"),
  },
  {
    _id: "2",
    type: "SALE",
    product: "1",
    employee: "2",
    quantity: 5,
    remainingQuantity: 10,
    backupQuantity: 5,
    date: new Date("2023-01-02"),
  },
];

// Mock database service
const mockDb = {
  // User methods
  findUserByUsername: (username) => {
    return users.find((user) => user.username === username);
  },

  findUserById: (id) => {
    return users.find((user) => user._id === id);
  },

  getAllUsers: () => {
    return users.map(({ password, ...user }) => user); // Remove passwords
  },

  // Product methods
  getAllProducts: () => {
    return [...products];
  },

  findProductById: (id) => {
    return products.find((product) => product._id === id);
  },

  // Transaction methods
  getAllTransactions: (filters = {}) => {
    let filteredTransactions = [...transactions];

    // Apply filters
    if (filters.employee) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.employee === filters.employee
      );
    }

    if (filters.product) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.product === filters.product
      );
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredTransactions = filteredTransactions.filter(
        (t) => t.date >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredTransactions = filteredTransactions.filter(
        (t) => t.date <= endDate
      );
    }

    return filteredTransactions;
  },
};

module.exports = mockDb;
