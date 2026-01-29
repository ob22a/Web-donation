import { getDonor, updateDonor, uploadProfilePicture } from '../controllers/donorController.js';
import { auth } from '../middleware/authMiddleware.js';

export default async function donorRoutes(req, res, pathname) {
  // GET /api/donor/:id

  // PATCH /api/donor/update/
  if (req.method === "PATCH" && pathname === "/api/donor/update/") {
    if (!auth(req, res)) return true;
    await updateDonor(req, res);
    return true;
  }

  // POST /api/donor/profile-picture/:id
  if (req.method === "POST" && pathname.startsWith("/api/donor/profile-picture/")) {
    if (!auth(req, res)) return true;
    const segments = pathname.split("/").filter(Boolean);
    req.params = { id: segments.at(-1) }; // last segment
    await uploadProfilePicture(req, res);
    return true;
  }

  return false;
}
