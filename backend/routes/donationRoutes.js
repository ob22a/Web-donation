// routes/donationRoutes.js
import {
  createDonation,
  getDonationsByCampaign,
  getMyDonations,
  getNGODonations,
  emailDonationReceipt,
  getDonationReceiptStatus,
} from "../controllers/donationController.js";
import { auth } from "../middleware/authMiddleware.js";

export default async function donationRoutes(req, res, pathname) {
  const segments = pathname.split("/").filter(Boolean);

  // GET /api/donations/my
  if (pathname === "/api/donations/my" && req.method === "GET") {
    if (!auth(req, res)) return false;
    await getMyDonations(req, res);
    return true;
  }

  // GET /api/donations/ngo
  if (pathname === "/api/donations/ngo" && req.method === "GET") {
    if (!auth(req, res)) return false;
    await getNGODonations(req, res);
    return true;
  }

  // POST /api/donations
  if (pathname === "/api/donations" && req.method === "POST") {
    await createDonation(req, res);
    return true;
  }

  // POST /api/donations/:donationId/email
  if (
    segments.length === 4 &&
    segments[0] === "api" &&
    segments[1] === "donations" &&
    segments[3] === "email" &&
    req.method === "POST"
  ) {
    if (!auth(req, res)) return false;

    req.params = { donationId: segments[2] };
    await emailDonationReceipt(req, res);
    return true;
  }

  // GET /api/donations/:donationId/receipt-status
  if (
    segments.length === 4 &&
    segments[0] === "api" &&
    segments[1] === "donations" &&
    segments[3] === "receipt-status" &&
    req.method === "GET"
  ) {
    if (!auth(req, res)) return false;

    req.params = { donationId: segments[2] };
    await getDonationReceiptStatus(req, res);
    return true;
  }

  // GET /api/donations/campaign/:campaignId
  if (
    segments.length === 4 &&
    segments[0] === "api" &&
    segments[1] === "donations" &&
    segments[2] === "campaign" &&
    req.method === "GET"
  ) {
    req.params = { campaignId: segments[3] };
    await getDonationsByCampaign(req, res);
    return true;
  }

  return false;
}
