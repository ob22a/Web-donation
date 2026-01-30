import { register, login, getProfile, logout, updateProfile, uploadProfilePicture } from "../controllers/authController.js";
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
    if (!auth(req, res)) return false;
    await getProfile(req, res);
    return true;
  }
  if (req.method === "POST" && pathname === "/api/auth/logout") {
    if (!auth(req, res)) return false;
    await logout(req, res);
    return true;
  }

  if (req.method === "PATCH" && pathname === "/api/auth/profile") {
    if (!auth(req, res)) return false;
    await updateProfile(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/profile-picture") {
    if (!auth(req, res)) return false;
    await uploadProfilePicture(req, res);
    return true;
  }

  return false; // not handled
}
