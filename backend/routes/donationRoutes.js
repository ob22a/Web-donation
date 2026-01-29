import { createDonation, getDonationsByCampaign, getMyDonations, getNGODonations } from "../controllers/donationController.js";
import { auth } from "../middleware/authMiddleware.js";

export default async function donationRoutes(req, res, pathname) {
    if (pathname === '/api/donations/my' && req.method === 'GET') {
        if (!auth(req, res)) return false;
        await getMyDonations(req, res);
        return true;
    } else if (pathname === '/api/donations/ngo' && req.method === 'GET') {
        if (!auth(req, res)) return false;
        await getNGODonations(req, res);
        return true;
    } else if (pathname === '/api/donations' && req.method === 'POST') {
        // Optional auth: donors might want to donate anonymously or logged out?
        await createDonation(req, res);
        return true;
    } else if (pathname.startsWith('/api/donations/') && req.method === 'GET') {
        await getDonationsByCampaign(req, res);
        return true;
    }
    return false;
}
