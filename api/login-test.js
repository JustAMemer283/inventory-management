// Simple login test endpoint for Vercel serverless functions
// This bypasses the database to test if the API is working

module.exports = (req, res) => {
  // Only handle POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed",
    });
  }

  try {
    const { username, password } = req.body;

    // Log the request for debugging
    console.log("Login test request received:", {
      username,
      headers: req.headers,
      method: req.method,
      url: req.url,
    });

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username and password are required",
      });
    }

    // Return a mock successful response
    return res.status(200).json({
      status: "success",
      message: "Login test successful",
      user: {
        id: "123456789",
        username: username,
        name: "Test User",
        role: "user",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Login test error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};
