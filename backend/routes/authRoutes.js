import { register, login,getProfile } from "../controllers/authController.js";
import { auth } from "../middleware/authMiddleware.js";

export default async function authRoutes(req, res, pathname) {
  if (req.method === "POST" && pathname === "/api/auth/register") {
    await register(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    await login(req, res);
    return true;
  }

  if (req.method === "GET" && pathname === "/api/auth/profile") {
    if(!auth(req,res)) return false;
    await getProfile(req,res);
    return true;
  }

  return false; // not handled
}
