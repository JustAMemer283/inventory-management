import axios from "axios";

// Determine the API URL based on the environment
const API_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin + "/api" // In production, use the current origin with /api
    : "http://localhost:5000/api"; // In development, use localhost

console.log("API URL:", API_URL); // Log the API URL for debugging

// create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // enable sending cookies
  timeout: 10000, // 10 second timeout
  retries: 2, // number of retries
  retryDelay: 1000, // delay between retries in ms
});

// Token management
const tokenManager = {
  getToken: () => localStorage.getItem("auth_token"),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("auth_token", token);
    }
  },
  removeToken: () => localStorage.removeItem("auth_token"),
  isAuthenticated: () => !!localStorage.getItem("auth_token"),
};

// Add request interceptor for authentication and debugging
api.interceptors.request.use(
  (config) => {
    // Add timestamp to the request for debugging
    config.metadata = { startTime: new Date() };

    // Add authentication token if available
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const startTime = response.config.metadata.startTime;
    const duration = endTime - startTime;

    console.log(
      `Response from ${response.config.url}:`,
      response.status,
      `(${duration}ms)`
    );
    return response;
  },
  async (error) => {
    const { config } = error;

    // If there's no config, we can't retry
    if (!config) {
      return Promise.reject(error);
    }

    // Set retries if not set
    config.retries = config.retries ?? api.defaults.retries;
    config.retryCount = config.retryCount ?? 0;

    // Check if we should retry
    if (config.retryCount < config.retries) {
      // Increase retry count
      config.retryCount += 1;

      console.log(
        `Retrying request to ${config.url} (${config.retryCount}/${config.retries})...`
      );

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, api.defaults.retryDelay)
      );

      // Retry the request
      return api(config);
    }

    // Log error details
    console.error("Response error:", error);
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    }

    return Promise.reject(error);
  }
);

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

  // delete transactions older than specified days
  deleteOlderThan: async (days) => {
    const response = await api.delete(`/transactions/older-than/${days}`);
    return response.data;
  },
};

// auth api service
export const authApi = {
  // login
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      // Save token
      if (response.data.token) {
        tokenManager.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      // If we get a 504 timeout error or MongoDB connection error, try the fallback
      if (
        (error.response && error.response.status === 504) ||
        (error.message && error.message.includes("MongoDB"))
      ) {
        console.log("Login failed, trying fallback authentication...");
        try {
          // First try the auth-fallback endpoint
          const fallbackResponse = await api.post(
            "/auth-fallback/login",
            credentials
          );
          console.log("Fallback login successful:", fallbackResponse.data);
          // Save token
          if (fallbackResponse.data.token) {
            tokenManager.setToken(fallbackResponse.data.token);
          }
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error(
            "Fallback login failed, trying login-test:",
            fallbackError
          );

          // If fallback fails, try the login-test endpoint
          try {
            const testResponse = await api.post("/login-test", credentials);
            console.log("Test login successful:", testResponse.data);
            // Save token
            if (testResponse.data.token) {
              tokenManager.setToken(testResponse.data.token);
            }
            return testResponse.data;
          } catch (testError) {
            console.error("All login attempts failed:", testError);
            throw error; // Throw the original error
          }
        }
      }
      throw error;
    }
  },

  // get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      // Update token if a new one is provided
      if (response.data.token) {
        tokenManager.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      // If we get a 504 timeout error or MongoDB connection error, try the fallback
      if (
        (error.response && error.response.status === 504) ||
        (error.message && error.message.includes("MongoDB"))
      ) {
        console.log("getCurrentUser failed, trying fallback...");
        try {
          // Try the fallback endpoint
          const fallbackResponse = await api.get("/auth-fallback/me");
          console.log(
            "Fallback getCurrentUser successful:",
            fallbackResponse.data
          );
          // Update token if a new one is provided
          if (fallbackResponse.data.token) {
            tokenManager.setToken(fallbackResponse.data.token);
          }
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error("Fallback getCurrentUser failed:", fallbackError);

          // Return a mock user for development
          if (process.env.NODE_ENV !== "production") {
            console.log("Returning mock user for development");
            return {
              id: "123456789",
              username: "testuser",
              name: "Test User",
              role: "user",
              isFallback: true,
            };
          }

          throw error; // Throw the original error in production
        }
      }
      throw error;
    }
  },

  // logout
  logout: async () => {
    try {
      const response = await api.post("/auth/logout");
      // Remove token
      tokenManager.removeToken();
      return response.data;
    } catch (error) {
      // If we get a 504 timeout error or MongoDB connection error, try the fallback
      if (
        (error.response && error.response.status === 504) ||
        (error.message && error.message.includes("MongoDB"))
      ) {
        console.log("Logout failed, trying fallback...");
        try {
          // Try the fallback endpoint
          const fallbackResponse = await api.post("/auth-fallback/logout");
          console.log("Fallback logout successful:", fallbackResponse.data);
          // Remove token
          tokenManager.removeToken();
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error("Fallback logout failed:", fallbackError);

          // For logout, we can just remove the token and return success
          tokenManager.removeToken();
          return { message: "Logged out successfully (client-side only)" };
        }
      }
      // Even if the server logout fails, remove the token
      tokenManager.removeToken();
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return tokenManager.isAuthenticated();
  },

  // verify password
  verifyPassword: async (password) => {
    const response = await api.post("/auth/verify-password", { password });
    return response.data;
  },
};
