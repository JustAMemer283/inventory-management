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

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
    // Add timestamp to the request for debugging
    config.metadata = { startTime: new Date() };
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
};

// auth api service
export const authApi = {
  // login
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      // If we get a 504 timeout error, try the test login endpoint
      if (error.response && error.response.status === 504) {
        console.log("Login timed out, trying test endpoint...");
        try {
          // Try the test login endpoint
          const testResponse = await api.post("/login-test", credentials);
          console.log("Test login successful:", testResponse.data);

          // If we're in development, return the test response
          if (process.env.NODE_ENV !== "production") {
            return testResponse.data;
          } else {
            // In production, still throw the error
            throw error;
          }
        } catch (testError) {
          console.error("Test login also failed:", testError);
          throw error; // Throw the original error
        }
      }
      throw error;
    }
  },

  // get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      // If we get a 504 timeout error, return a mock user for development
      if (
        error.response &&
        error.response.status === 504 &&
        process.env.NODE_ENV !== "production"
      ) {
        console.log(
          "getCurrentUser timed out, returning mock user for development"
        );
        return {
          id: "123456789",
          username: "testuser",
          name: "Test User",
          role: "user",
        };
      }
      throw error;
    }
  },

  // logout
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};
