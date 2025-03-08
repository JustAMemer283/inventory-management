// This file is specifically for Vercel serverless functions
// It exports the Express app from server.js

// Import the Express app from server.js
const app = require("../server.js");

// Export the app as a module
module.exports = app;
