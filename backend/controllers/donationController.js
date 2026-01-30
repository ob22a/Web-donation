// controllers/donationController.js
import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";
import { sendJson } from "../utils/response.js";
import { sendDonationReceipt } from "../utils/donationEmailService.js";
import { generateReceiptHTML } from "../utils/donationEmailService.js";

/* ============================
   CREATE DONATION
============================ */
export async function createDonation(req, res) {
  try {
    const { campaignId, donorId, amount, isAnnonymous, isManual, method } =
      req.body;

    if (!campaignId || !amount) {
      return sendJson(res, 400, {
        message: "campaignId and amount are required",
      });
    }

    const donation = await Donation.create({
      campaignId,
      donorId: donorId || null,
      amount,
      isAnnonymous,
      isManual,
      method: method || { type: null, identifier: null },
    });

    return sendJson(res, 201, { donation });
  } catch (err) {
    console.error("Error creating donation:", err);
    return sendJson(res, 500, { message: "Internal Server Error" });
  }
}

/* ============================
   MY DONATIONS
============================ */
export async function getMyDonations(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;

    const donations = await Donation.find({ donorId: userId })
      .populate({
        path: "campaignId",
        select: "title ngo coverImage",
        populate: { path: "ngo", select: "name logo" },
      })
      .sort({ createdAt: -1 });

    return sendJson(res, 200, { donations });
  } catch (err) {
    console.error("Error fetching my donations:", err);
    return sendJson(res, 500, { message: "Failed to fetch donations" });
  }
}

/* ============================
   NGO DONATIONS
============================ */
export async function getNGODonations(req, res) {
  try {
    const ngoId = req.user?.ngoId;

    const campaigns = await Campaign.find({ ngo: ngoId }).select("_id");
    const campaignIds = campaigns.map((c) => c._id);

    const donations = await Donation.find({
      campaignId: { $in: campaignIds },
    })
      .populate("donorId", "name email")
      .populate("campaignId", "title")
      .sort({ createdAt: -1 });

    return sendJson(res, 200, { donations });
  } catch (err) {
    console.error("Error fetching NGO donations:", err);
    return sendJson(res, 500, { message: "Failed to fetch donations" });
  }
}

/* ============================
   DONATIONS BY CAMPAIGN
============================ */
export async function getDonationsByCampaign(req, res) {
  try {
    const { campaignId } = req.params;

    const donations = await Donation.find({ campaignId })
      .populate("donorId", "name")
      .sort({ createdAt: -1 });

    return sendJson(res, 200, { donations });
  } catch (err) {
    console.error("Error fetching donations by campaign:", err);
    return sendJson(res, 500, { message: "Failed to fetch donations" });
  }
}

/* ============================
   EMAIL RECEIPT
============================ */
export async function emailDonationReceipt(req, res) {
  try {
    const { donationId } = req.params;

    const donation = await Donation.findById(donationId)
      .populate("donorId", "name email")
      .populate({
        path: "campaignId",
        populate: { path: "ngo", select: "name" },
      });

    if (!donation) return sendJson(res, 404, { message: "Donation not found" });

    const userId = req.user?.userId || req.user?.id;
    const userRole = req.user?.role;
    const userNgoId = req.user?.ngoId;

    let hasPermission = false;
    if (userRole === "admin") hasPermission = true;
    else if (
      ["ngo_admin", "ngo_user"].includes(userRole) &&
      donation.campaignId?.ngo?._id?.toString() === userNgoId
    )
      hasPermission = true;
    else if (
      userRole === "donor" &&
      donation.donorId?._id?.toString() === userId
    )
      hasPermission = true;

    if (!hasPermission)
      return sendJson(res, 403, { message: "Permission denied" });

    if (!donation.donorId?.email)
      return sendJson(res, 400, { message: "Donor has no email" });

    const subject = `Donation Receipt — ${donation.campaignId?.title}`;
    const html = generateReceiptHTML({ donation });

    const emailResult = await sendDonationReceipt({
      to: donation.donorId.email,
      subject,
      html,
    });

    donation.receiptEmailSent = emailResult.ok;
    donation.receiptSentAt = emailResult.ok
      ? new Date()
      : donation.receiptSentAt;

    await donation.save();

    return sendJson(res, 200, {
      message: "Receipt sent successfully",
      donation,
    });
  } catch (err) {
    console.error("Error emailing receipt:", err);
    return sendJson(res, 500, { message: "Internal Server Error" });
  }
}

/* ============================
   RECEIPT STATUS
============================ */
export async function getDonationReceiptStatus(req, res) {
  try {
    const { donationId } = req.params;

    const donation = await Donation.findById(donationId).select(
      "receiptEmailSent receiptSentAt",
    );

    if (!donation) return sendJson(res, 404, { message: "Donation not found" });

    return sendJson(res, 200, {
      receiptEmailSent: donation.receiptEmailSent,
      receiptSentAt: donation.receiptSentAt,
      canResend:
        !donation.receiptEmailSent ||
        Date.now() - new Date(donation.receiptSentAt).getTime() >
          24 * 60 * 60 * 1000,
    });
  } catch (err) {
    console.error("Error fetching receipt status:", err);
    return sendJson(res, 500, { message: "Internal Server Error" });
  }
}
