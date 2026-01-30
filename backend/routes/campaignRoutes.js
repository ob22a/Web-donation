import { createCampaign, getCampaignsByNGO, getCampaignById, getCampaignsByNGOId, getAllCampaigns } from "../controllers/campaignsController.js";
import { auth } from "../middleware/authMiddleware.js";

/**
 * Campaign routes handler.
 * 
 * Architecture: Routes campaign-related requests to appropriate controllers.
 * Order matters: More specific routes (e.g., /api/campaigns/ngo/) must be
 * checked before generic ones (e.g., /api/campaigns/).
 * 
 * Route patterns:
 * - POST /api/campaigns/* - Create campaign (authenticated)
 * - GET /api/campaigns/ - Get campaigns for authenticated NGO
 * - GET /api/campaigns/ngo/* - Get campaigns for specific NGO (public)
 * - GET /api/campaigns/all - Get all active campaigns (public)
 * - GET /api/campaigns/* - Get specific campaign by ID (authenticated)
 */
export default async function campaignRoutes(req, res, pathname) {
    if (pathname.startsWith('/api/campaigns/') && req.method === 'POST') {
        if (!auth(req, res)) return false;
        await createCampaign(req, res);
        return true;
    } else if (pathname === '/api/campaigns/' && req.method === 'GET') {
        if (!auth(req, res)) return false;
        await getCampaignsByNGO(req, res);
        return true;
    } else if (pathname.startsWith('/api/campaigns/ngo/') && req.method === 'GET') {
        await getCampaignsByNGOId(req, res);
        return true;
    } else if (pathname === '/api/campaigns/all' && req.method === 'GET') {
        await getAllCampaigns(req, res);
        return true;
    } else if (pathname.startsWith('/api/campaigns/') && req.method === 'GET') {
        if (!auth(req, res)) return false;
        await getCampaignById(req, res);
        return true;
    }
    return false;

}