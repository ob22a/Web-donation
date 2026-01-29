import { createCampaign, getCampaignsByNGO, getCampaignById, getCampaignsByNGOId, getAllCampaigns } from "../controllers/campaignsController.js";
import { auth } from "../middleware/authMiddleware.js";

export default async function campaignRoutes(req, res, pathname) {
    if (pathname.startsWith('/api/campaigns/') && req.method === 'POST') {
        if (!auth(req, res)) return false;
        await createCampaign(req, res);
        return true;
    } else if (pathname === '/api/campaigns/' && req.method === 'GET') {
        if (!auth(req, res)) return false;
        await getCampaignsByNGO(req, res);
        return true;
    } else if (pathname === '/api/campaigns/ngo/' && req.method === 'GET') {
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