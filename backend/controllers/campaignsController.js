import Campaign from "../models/Campaign.js";
import NGO from "../models/NGO.js";
import { sendJson } from "../utils/response.js";

/**
 * Create a new campaign.
 * 
 * Architecture: Campaigns are created by authenticated NGOs. The NGO ID
 * is extracted from the JWT token (req.user.userId) set by auth middleware.
 * 
 * Required fields: title, description, targetAmount, initialAmount, status
 * The ngo field is automatically set from the authenticated user.
 */
export async function createCampaign(req, res) {
    try {
        const data = req.body;
        // title, description, targetAmount, initialAmount, status, ngo
        const ngoId = req.user.userId;
        const newCampaign = new Campaign({
            ngo: ngoId,
            ...data
        });
        await newCampaign.save();
        sendJson(res, 201, { campaign: newCampaign });
    } catch (err) {
        console.error('Error creating campaign:', err);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
}

/**
 * Get all campaigns for the authenticated NGO.
 * 
 * Architecture: Returns campaigns created by the logged-in NGO.
 * Uses populate to include NGO name and banner image for display.
 * 
 * Note: Campaign.ngo references 'User' model (not 'NGO') because NGO is a discriminator.
 * When populating, Mongoose automatically includes discriminator-specific fields
 * (like ngoName, bannerImage) from the NGO discriminator documents.
 */
export async function getCampaignsByNGO(req, res) {
    try {
        const ngoId = req.user.userId;
        const campaigns = await Campaign.find({ ngo: ngoId }).populate('ngo', 'ngoName bannerImage');
        sendJson(res, 200, { campaigns });
    } catch (err) {
        console.error('Error fetching campaigns:', err);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
}

/**
 * Get all active campaigns (public endpoint).
 * 
 * Architecture: Returns only active campaigns for public browsing.
 * Used by the NGOs page and campaign listing pages. No authentication required.
 * 
 * Note: Populates 'ngo' field which references User model. Since NGO is a discriminator
 * of User, Mongoose automatically includes NGO-specific fields when populating.
 */
export async function getAllCampaigns(req, res) {
    try {
        const campaigns = await Campaign.find({ status: 'active' }).populate('ngo', 'ngoName bannerImage');
        sendJson(res, 200, { campaigns });
    } catch (err) {
        console.error('Error fetching all campaigns:', err);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
}

/**
 * Get a single campaign by ID.
 * 
 * Architecture: Extracts campaign ID from URL path (e.g., /api/campaigns/123).
 * Uses URL parsing since we're not using Express router params.
 * Populates NGO data for display on campaign detail page.
 */
export async function getCampaignById(req, res) {
    try {
        // Extract campaign ID from URL path
        // Example: /api/campaigns/507f1f77bcf86cd799439011 -> 507f1f77bcf86cd799439011
        const segments = req.url.split("?")[0].split("/").filter(Boolean);
        const campaignId = segments.at(-1);

        const campaign = await Campaign.findById(campaignId).populate('ngo', 'ngoName bannerImage description');
        if (!campaign) {
            return sendJson(res, 404, { message: 'Campaign not found' });
        }
        sendJson(res, 200, { campaign });
    } catch (err) {
        console.error('Error fetching campaign:', err);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
}

/**
 * Get all campaigns for a specific NGO by NGO ID (public endpoint).
 * 
 * Architecture: Used to display all campaigns for a specific NGO on their
 * profile page. No authentication required - this is public data.
 * Extracts NGO ID from URL path.
 */
export async function getCampaignsByNGOId(req, res) {
    try {
        // Extract NGO ID from URL path
        // Example: /api/campaigns/ngo/507f1f77bcf86cd799439011 -> 507f1f77bcf86cd799439011
        const segments = req.url.split("?")[0].split("/").filter(Boolean);
        const ngoId = segments.at(-1);

        const campaigns = await Campaign.find({ ngo: ngoId, status: 'active' });
        sendJson(res, 200, { campaigns });
    } catch (err) {
        console.error('Error fetching campaigns for NGO:', err);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
}