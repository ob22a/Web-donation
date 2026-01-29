// POST donation
// Get all donations for a specific campaign paginated 

import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";
import { sendJson } from "../utils/response.js";


export async function createDonation(req, res) {
  try {
    const { campaignId, donorId, amount, isAnnonymous, isManual, method } = req.body;
    if (!campaignId || !amount) {
      return sendJson(res, 400, { message: 'campaignId and amount are required' });
    }

    const newDonation = new Donation({
      campaignId,
      donorId: donorId || null,
      amount,
      isAnnonymous,
      isManual,
      method: method || { type: null, identifier: null },
    });
    await newDonation.save();
    sendJson(res, 201, { newDonation });
  } catch (err) {
    console.error('Error creating donation:', err);
    sendJson(res, 500, { message: 'Internal Server Error' });
  }
}

export async function getMyDonations(req, res) {
  try {
    const donorId = req.user.userId;
    const donations = await Donation.find({ donorId })
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 });
    sendJson(res, 200, { donations });
  } catch (err) {
    console.error("Error fetching my donations:", err);
    sendJson(res, 500, { message: "Internal Server Error" });
  }
}

export async function getDonationsByCampaign(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const segments = url.pathname.split("/").filter(Boolean);
    const campaignId = segments[2]; // api/donations/:id

    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Donation.countDocuments({ campaignId });

    // Fetch current page
    const donations = await Donation.find({ campaignId })
      .populate('donorId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    sendJson(res, 200, {
      donations,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error("Error fetching donations:", err);
    sendJson(res, 500, { message: "Internal Server Error" });
  }
}

export async function getNGODonations(req, res) {
  try {
    const ngoId = req.user.userId;

    // 1. Get all campaign IDs for this NGO
    const campaigns = await Campaign.find({ ngo: ngoId }).select('_id');
    const campaignIds = campaigns.map(c => c._id);

    // 2. Get all donations for those campaigns
    const donations = await Donation.find({ campaignId: { $in: campaignIds } })
      .populate('donorId', 'name')
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 });

    sendJson(res, 200, { donations });
  } catch (err) {
    console.error("Error fetching NGO donations:", err);
    sendJson(res, 500, { message: "Internal Server Error" });
  }
}