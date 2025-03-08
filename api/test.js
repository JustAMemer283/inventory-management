// Simple test endpoint for Vercel serverless functions

module.exports = (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Test API endpoint is working",
    timestamp: new Date().toISOString(),
    headers: req.headers,
    method: req.method,
    url: req.url,
  });
};
