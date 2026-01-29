import jwt from "jsonwebtoken";
import { sendJson } from "../utils/response.js";

/**
 * Auth middleware for Node-only architecture
 * Returns true if authenticated, false otherwise
 */
export function auth(req, res) {
  const cookieHeader = req.headers.cookie || "";
  let token = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    sendJson(res, 401, { message: "No token provided" });
    return false; // stop execution
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    req.user = decoded; // attach user to request
    return true;
  } catch (err) {
    sendJson(res, 401, { message: "Invalid or expired token" });
    return false;
  }
}
