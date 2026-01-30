// POST donation
// Get all donations for a specific campaign paginated 

import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";
import Donor from "../models/Donor.js";
import { sendJson } from "../utils/response.js";


export async function createDonation(req, res) {
  try {
    const { campaignId, donorId, donorName, amount, isAnnonymous, isManual, method } = req.body;
    if (!campaignId || !amount) {
      return sendJson(res, 400, { message: 'campaignId and amount are required' });
    }

    const newDonation = new Donation({
      campaignId,
      donorId: donorId || null,
      donorName: donorName || null,
      amount,
      isAnnonymous,
      isManual,
      method: method || { type: null, identifier: null },
    });
    await newDonation.save();

    // ---- Data Integration: Update Related Entities ----

    // 1. Update Campaign raisedAmount
    // Why: Ensures the progress bar on the frontend reflects real data.
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { raisedAmount: amount }
    });

    // 2. Update Donor stats if not a guest
    if (donorId) {
      const donor = await Donor.findById(donorId);
      if (donor) {
        // Increment totals
        donor.totalDonated += amount;

        // We only increment supported count if they haven't donated to this campaign before
        // But for simplicity in this pass, we'll increment if it's a new donation (behavior preservation)
        const previousDonations = await Donation.countDocuments({ donorId, _id: { $ne: newDonation._id } });
        if (previousDonations === 0) {
          // 3. Award 'Early Supporter' badge for first donation
          // Replaces frontend static community message.
          if (!donor.badges.includes("Early Supporter")) {
            donor.badges.push("Early Supporter");
          }
        }

        // Increment count of total successful contributions
        donor.campaignsSupportedCount += 1;

        await donor.save();
      }
    }

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

/**
 * Get aggregated statistics for the NGO dashboard.
 * 
 * Why: Provides real backend data for dashboard metrics (Total Raised, Donors, Active Campaigns).
 * This eliminates the placeholders previously seen on the NGO dashboard.
 */
export async function getNGODashboardStats(req, res) {
  try {
    const ngoId = req.user.userId;

    // 1. Get all campaigns for this NGO
    const campaigns = await Campaign.find({ ngo: ngoId });
    const campaignIds = campaigns.map(c => c._id);

    // 2. Aggregate stats from campaigns
    const totalRaised = campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
    const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;

    // 3. Count unique donors from all donations to these campaigns
    // Why: Considers both registered donors (by ID) and manual/guest donors (by name).
    const uniqueDonorsResult = await Donation.aggregate([
      { $match: { campaignId: { $in: campaignIds } } },
      {
        $group: {
          _id: {
            $cond: [
              { $ne: ["$donorId", null] },
              "$donorId",
              "$donorName"
            ]
          }
        }
      },
      { $count: "count" }
    ]);

    const donorsCount = uniqueDonorsResult.length > 0 ? uniqueDonorsResult[0].count : 0;

    sendJson(res, 200, {
      totalRaised,
      activeCampaignsCount,
      donorsCount,
      totalCampaigns: campaigns.length
    });
  } catch (err) {
    console.error("Error fetching NGO stats:", err);
    sendJson(res, 500, { message: "Internal Server Error" });
  }
}