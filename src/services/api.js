import axios from "axios";

const API_URL = "http://localhost:5000/api";

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
  add: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // update product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
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
