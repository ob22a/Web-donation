import RecurringDonation from "../models/RecurringDonation.js";
import { sendJson } from "../utils/response.js";

// Create a recurring donation plan
export async function createRecurring(req, res) {
  try {
    const donorId = req.user?.userId;
    const { campaignId, amount, frequency, nextCharge, metadata } = req.body;

    if (!donorId) return sendJson(res, 401, { message: "Unauthorized" });
    if (!campaignId || !amount)
      return sendJson(res, 400, {
        message: "campaignId and amount are required",
      });

    const plan = new RecurringDonation({
      donorId,
      campaignId,
      amount,
      frequency: frequency || "Monthly",
      nextCharge: nextCharge ? new Date(nextCharge) : undefined,
      metadata: metadata || {},
    });

    await plan.save();
    sendJson(res, 201, { plan });
  } catch (err) {
    console.error("Error creating recurring donation:", err);
    sendJson(res, 500, { message: "Internal Server Error" });
  }
}

// Get current user's recurring plans
export async function getMyRecurring(req, res) {
  try {
    const donorId = req.user?.userId;
    if (!donorId) return sendJson(res, 401, { message: "Unauthorized" });

    const plans = await RecurringDonation.find({ donorId })
      .populate("campaignId", "title")
      .sort({ createdAt: -1 });

    sendJson(res, 200, { plans });
  } catch (err) {
    console.error("Error fetching recurring plans:", err);
    sendJson(res, 500, { message: "Internal Server Error" });
  }
}

// Cancel (deactivate) a recurring plan
export async function cancelRecurring(req, res) {
  try {
    const donorId = req.user?.userId;
    const urlParts = req.url.split("/").filter(Boolean);
    const id = urlParts[urlParts.length - 1];

    if (!donorId) return sendJson(res, 401, { message: "Unauthorized" });
    if (!id) return sendJson(res, 400, { message: "Plan id is required" });

    const plan = await RecurringDonation.findOne({ _id: id, donorId });
    if (!plan) return sendJson(res, 404, { message: "Plan not found" });

    plan.active = false;
    await plan.save();

    sendJson(res, 200, { message: "Recurring plan cancelled", plan });
  } catch (err) {
    console.error("Error cancelling recurring plan:", err);
    sendJson(res, 500, { message: "Internal Server Error" });
  }
}

// Update a recurring plan (amount/frequency/nextCharge)
export async function updateRecurring(req, res) {
  try {
    const donorId = req.user?.userId;
    const urlParts = req.url.split("/").filter(Boolean);
    const id = urlParts[urlParts.length - 1];
    if (!donorId) return sendJson(res, 401, { message: "Unauthorized" });
    if (!id) return sendJson(res, 400, { message: "Plan id is required" });

    const plan = await RecurringDonation.findOne({ _id: id, donorId });
    if (!plan) return sendJson(res, 404, { message: "Plan not found" });

    const { amount, frequency, nextCharge, active } = req.body;
    if (amount !== undefined) plan.amount = amount;
    if (frequency) plan.frequency = frequency;
    if (nextCharge) plan.nextCharge = new Date(nextCharge);
    if (active !== undefined) plan.active = active;

    await plan.save();
    sendJson(res, 200, { plan });
  } catch (err) {
    console.error("Error updating recurring plan:", err);
    sendJson(res, 500, { message: "Internal Server Error" });
  }
}
