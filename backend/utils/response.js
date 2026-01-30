/**
 * Utility function to send JSON responses with consistent formatting.
 * 
 * Why this utility: Centralizes response handling to ensure consistent
 * Content-Type headers and prevent double-sending responses (headersSent check).
 * Also handles cookie setting in a unified way.
 * 
 * @param {http.ServerResponse} res - The HTTP response object
 * @param {number} status - HTTP status code
 * @param {Object} data - Data object to send as JSON
 * @param {string[]} cookies - Array of cookie strings to set (optional)
 */
export function sendJson(res, status, data, cookies = []) {
  // Prevent double-sending: if headers already sent, ignore this call
  // This can happen if multiple code paths try to send a response
  if (res.headersSent) return;

  res.setHeader("Content-Type", "application/json");

  // Set cookies if provided (used for authentication tokens)
  if (cookies.length) {
    res.setHeader("Set-Cookie", cookies);
  }

  res.statusCode = status;
  res.end(JSON.stringify(data));
}