import axios from "axios";

// Determine the API URL based on the environment
const API_URL =
  process.env.NODE_ENV === "production"
    ? "/api" // In production, use relative path which will be handled by Vercel routing
    : "http://localhost:5000/api"; // In development, use localhost

// create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // enable sending cookies
});

// product api service
export const productApi = {
  // get all products
  getAll: async () => {
    const response = await api.get("/products");
    return response.data;
  },

  // add new product
  create: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // update product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // update stock
  updateStock: async (id, stockData) => {
    const response = await api.put(`/products/${id}/stock`, stockData);
    return response.data;
  },

  // delete product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // record sale
  recordSale: async (saleData) => {
    const response = await api.post("/products/sale", saleData);
    return response.data;
  },
};

// transaction api service
export const transactionApi = {
  // get all transactions with filters
  getAll: async (filters = {}) => {
    const response = await api.get("/transactions", {
      params: filters,
    });
    return response.data;
  },
};

// auth api service
export const authApi = {
  // login
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // logout
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};
