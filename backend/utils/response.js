/**
 * This is a function that helps us send json response and avoid redundancy
 * It also prevents sending twice by checking if res.headersSent is truthy
 * 
 * @param {http.ServerResponse} res - The HTTP response object
 * @param {number} status - HTTP status code
 * @param {Object} data - Data object to send as JSON
 * @param {string[]} cookies - Array of cookie strings to set (optional)
 */
export function sendJson(res, status, data, cookies = []) {
  if (res.headersSent) return;

  res.setHeader("Content-Type", "application/json");

  // used for authentication tokens
  if (cookies.length) {
    res.setHeader("Set-Cookie", cookies);
  }

  res.statusCode = status;
  res.end(JSON.stringify(data));
}