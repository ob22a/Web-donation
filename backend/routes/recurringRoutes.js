import { auth } from "../middleware/authMiddleware.js";
import {
  createRecurring,
  getMyRecurring,
  cancelRecurring,
  updateRecurring,
} from "../controllers/recurringController.js";

export default async function recurringRoutes(req, res, pathname) {
  // GET /api/recurring/my
  if (pathname === "/api/recurring/my" && req.method === "GET") {
    if (!auth(req, res)) return false;
    await getMyRecurring(req, res);
    return true;
  }

  // POST /api/recurring
  if (pathname === "/api/recurring" && req.method === "POST") {
    if (!auth(req, res)) return false;
    await createRecurring(req, res);
    return true;
  }

  // DELETE /api/recurring/:id
  if (pathname.startsWith("/api/recurring/") && req.method === "DELETE") {
    if (!auth(req, res)) return false;
    await cancelRecurring(req, res);
    return true;
  }

  // PATCH /api/recurring/:id
  if (pathname.startsWith("/api/recurring/") && req.method === "PATCH") {
    if (!auth(req, res)) return false;
    await updateRecurring(req, res);
    return true;
  }

  return false;
}
