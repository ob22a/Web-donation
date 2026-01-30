// routes/donationRoutes.js
import {
  createDonation,
  getDonationsByCampaign,
  getMyDonations,
  getNGODonations,
  emailDonationReceipt,
  getDonationReceiptStatus,
  bulkEmailReceipts,
} from "../controllers/donationController.js";
import { auth } from "../middleware/authMiddleware.js";

export default async function donationRoutes(req, res, pathname) {
  // Helper function to extract ID from URL
  const getPathSegments = () => pathname.split("/").filter((seg) => seg);

  if (pathname === "/api/donations/my" && req.method === "GET") {
    if (!auth(req, res)) return false;
    await getMyDonations(req, res);
    return true;
  } else if (pathname === "/api/donations/ngo" && req.method === "GET") {
    if (!auth(req, res)) return false;
    await getNGODonations(req, res);
    return true;
  } else if (pathname === "/api/donations" && req.method === "POST") {
    // Optional auth: donors might want to donate anonymously or logged out?
    await createDonation(req, res);
    return true;
  } else if (
    pathname === "/api/donations/bulk-receipts" &&
    req.method === "POST"
  ) {
    // Bulk send receipts (for NGO admins/platform admins)
    if (!auth(req, res)) return false;
    await bulkEmailReceipts(req, res);
    return true;
  } else if (
    pathname.startsWith("/api/donations/") &&
    pathname.endsWith("/email") &&
    req.method === "POST"
  ) {
    // Send receipt for specific donation
    // Path: /api/donations/:donationId/email
    if (!auth(req, res)) return false;
    await emailDonationReceipt(req, res);
    return true;
  } else if (
    pathname.startsWith("/api/donations/") &&
    pathname.endsWith("/receipt-status") &&
    req.method === "GET"
  ) {
    // Get receipt status for specific donation
    // Path: /api/donations/:donationId/receipt-status
    if (!auth(req, res)) return false;
    await getDonationReceiptStatus(req, res);
    return true;
  } else if (
    pathname.startsWith("/api/donations/campaign/") &&
    req.method === "GET"
  ) {
    // Get donations by campaign
    // Path: /api/donations/campaign/:campaignId
    const segments = getPathSegments();
    if (segments.length === 4 && segments[2] === "campaign") {
      await getDonationsByCampaign(req, res);
      return true;
    }
  } else if (pathname.startsWith("/api/donations/") && req.method === "GET") {
    // Get specific donation details
    // Path: /api/donations/:donationId
    const segments = getPathSegments();
    if (segments.length === 3) {
      // You could add a getDonationById function here
      return false; // Not implemented yet
    }
  }
  return false;
}
