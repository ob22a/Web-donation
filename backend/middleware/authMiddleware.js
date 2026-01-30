import jwt from "jsonwebtoken";
import { sendJson } from "../utils/response.js";

/**
 * Authentication middleware that validates JWT tokens from cookies.
 * 
 * Architecture: Returns boolean to indicate success/failure rather than
 * throwing errors. This allows route handlers to check auth status and
 * handle unauthorized requests gracefully.
 * 
 * Security: Tokens are stored in HttpOnly cookies (set by authController)
 * to prevent XSS attacks. The token contains userId, role, and email.
 * 
 * @param {http.IncomingMessage} req - Request object
 * @param {http.ServerResponse} res - Response object
 * @returns {boolean} true if authenticated, false otherwise
 */
export function auth(req, res) {
  // OPTIONS requests (CORS preflight) don't need authentication
  if (req.method === "OPTIONS") return true;
  
  // Extract token from cookie header
  // Cookie format: "token=xyz; otherCookie=abc"
  const cookieHeader = req.headers.cookie || "";
  let token = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    sendJson(res, 401, { message: "No token provided" });
    return false; // stop execution - route handler should not proceed
  }

  try {
    // Verify and decode JWT token
    // If valid, attach decoded payload (userId, role, email) to request
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    req.user = decoded; // attach user to request for use in route handlers
    return true;
  } catch (err) {
    // Token is invalid, expired, or malformed
    sendJson(res, 401, { message: "Invalid or expired token" });
    return false;
  }
}
