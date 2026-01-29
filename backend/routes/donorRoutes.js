import { getDonor, updateDonor, uploadProfilePicture } from '../controllers/donorController.js';
import { auth } from '../middleware/authMiddleware.js';

export default async function donorRoutes(req, res, pathname) {
  const segments = pathname.split("/").filter(Boolean);

  // GET /api/donor/:id
  if (req.method === "GET" && segments[0] === "api" && segments[1] === "donor" && segments[2]) {
    if (!auth(req, res)) return true;
    req.params = { id: segments[2] };
    await getDonor(req, res);
    return true;
  }

  // PATCH /api/donor/update/:id
  if (req.method === "PATCH" && segments[0] === "api" && segments[1] === "donor" && segments[2] === "update" && segments[3]) {
    if (!auth(req, res)) return true;
    req.params = { id: segments[3] };
    await updateDonor(req, res);
    return true;
  }

  // POST /api/donor/profile-picture/:id
  if (req.method === "POST" && pathname.startsWith("/api/donor/profile-picture/")) {
    if (!auth(req, res)) return true;
    req.params = { id: segments[3] }; // last segment
    await uploadProfilePicture(req, res);
    return true;
  }

  return false;
}
