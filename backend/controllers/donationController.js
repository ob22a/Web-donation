// controllers/donationController.js
import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";
import { sendDonationReceiptEmail } from "../services/donationEmailService.js";

// Your existing functions...
export const createDonation = async (req, res) => {
  try {
    const donationData = req.body;

    // Auto-set receiptEmailSent to false for new donations
    donationData.receiptEmailSent = false;

    const donation = await Donation.create(donationData);

    // Auto-send receipt if conditions are met (optional)
    if (process.env.AUTO_SEND_RECEIPTS === "true") {
      // Check if we should auto-send receipt
      const shouldAutoSend =
        donation.amount > 0 &&
        !donation.isAnnonymous &&
        (!donation.isManual || donation.method?.identifier); // Manual donations need email identifier

      if (shouldAutoSend) {
        // Send receipt asynchronously (don't block response)
        sendDonationReceiptEmail(donation._id)
          .then((result) => {
            console.log(
              `Auto-sent receipt for donation ${donation._id}:`,
              result.success ? "Success" : result.error,
            );
          })
          .catch((error) => {
            console.error(
              `Failed to auto-send receipt for ${donation._id}:`,
              error,
            );
          });
      }
    }

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: donation,
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create donation",
      error: error.message,
    });
  }
};

export const getMyDonations = async (req, res) => {
  try {
    const userId = req.user.id;
    const donations = await Donation.find({ donorId: userId })
      .populate({
        path: "campaignId",
        select: "title ngo coverImage",
        populate: {
          path: "ngo",
          select: "name logo",
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: donations,
    });
  } catch (error) {
    console.error("Error fetching user donations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
};

export const getNGODonations = async (req, res) => {
  try {
    const ngoId = req.user.ngoId;

    // Find campaigns by this NGO
    const campaigns = await Campaign.find({ ngo: ngoId }).select("_id");
    const campaignIds = campaigns.map((camp) => camp._id);

    const donations = await Donation.find({ campaignId: { $in: campaignIds } })
      .populate({
        path: "campaignId",
        select: "title",
      })
      .populate({
        path: "donorId",
        select: "name email",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: donations,
    });
  } catch (error) {
    console.error("Error fetching NGO donations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
};

export const getDonationsByCampaign = async (req, res) => {
  try {
    // Extract campaign ID from URL
    const campaignId = req.url.split("/")[3];

    const donations = await Donation.find({ campaignId })
      .populate({
        path: "donorId",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: donations,
    });
  } catch (error) {
    console.error("Error fetching campaign donations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
};

// NEW: Send donation receipt email
export const emailDonationReceipt = async (req, res) => {
  try {
    // Extract donation ID from URL
    // URL pattern: /api/donations/:donationId/email
    const donationId = req.url.split("/")[3];

    if (!donationId) {
      return res.status(400).json({
        success: false,
        message: "Donation ID is required",
      });
    }

    // Check if user has permission
    const donation = await Donation.findById(donationId).populate({
      path: "campaignId",
      populate: {
        path: "ngo",
        select: "_id",
      },
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Check permissions: Donor can only email their own receipts
    // NGO admins can email receipts for their NGO's donations
    // Platform admins can email any receipt
    const userId = req.user.id;
    const userRole = req.user.role;
    const userNgoId = req.user.ngoId;

    let hasPermission = false;

    if (userRole === "admin") {
      hasPermission = true;
    } else if (userRole === "ngo_admin" || userRole === "ngo_user") {
      // Check if donation belongs to user's NGO
      if (donation.campaignId?.ngo?._id?.toString() === userNgoId) {
        hasPermission = true;
      }
    } else if (userRole === "donor") {
      // Check if donation belongs to this donor
      if (donation.donorId?.toString() === userId) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to send this receipt",
      });
    }

    // Send the receipt email
    const result = await sendDonationReceiptEmail(donationId);

    if (result.success) {
      res.json({
        success: true,
        message: "Receipt sent successfully",
        data: result.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to send receipt",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error sending donation receipt email:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// NEW: Get donation receipt status
export const getDonationReceiptStatus = async (req, res) => {
  try {
    const donationId = req.url.split("/")[3];

    const donation = await Donation.findById(donationId).select(
      "receiptEmailSent receiptSentAt donorId",
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Check permissions (similar to emailDonationReceipt)
    // ... permission logic ...

    res.json({
      success: true,
      data: {
        receiptEmailSent: donation.receiptEmailSent,
        receiptSentAt: donation.receiptSentAt,
        canResend:
          !donation.receiptEmailSent ||
          (donation.receiptSentAt &&
            Date.now() - new Date(donation.receiptSentAt).getTime() >
              24 * 60 * 60 * 1000), // 24 hours
      },
    });
  } catch (error) {
    console.error("Error fetching receipt status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// NEW: Bulk send receipts for multiple donations
export const bulkEmailReceipts = async (req, res) => {
  try {
    const { donationIds } = req.body;

    if (
      !donationIds ||
      !Array.isArray(donationIds) ||
      donationIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Array of donation IDs is required",
      });
    }

    // Check permissions for each donation
    const userId = req.user.id;
    const userRole = req.user.role;
    const userNgoId = req.user.ngoId;

    const results = [];

    for (const donationId of donationIds) {
      try {
        const donation = await Donation.findById(donationId).populate({
          path: "campaignId",
          populate: {
            path: "ngo",
            select: "_id",
          },
        });

        if (!donation) {
          results.push({
            donationId,
            success: false,
            error: "Donation not found",
          });
          continue;
        }

        // Check permissions
        let hasPermission = false;

        if (userRole === "admin") {
          hasPermission = true;
        } else if (userRole === "ngo_admin" || userRole === "ngo_user") {
          if (donation.campaignId?.ngo?._id?.toString() === userNgoId) {
            hasPermission = true;
          }
        }

        if (!hasPermission) {
          results.push({
            donationId,
            success: false,
            error: "Permission denied",
          });
          continue;
        }

        // Send receipt
        const result = await sendDonationReceiptEmail(donationId);
        results.push({
          donationId,
          success: result.success,
          ...(result.success
            ? { email: result.data.email }
            : { error: result.error }),
        });
      } catch (error) {
        results.push({
          donationId,
          success: false,
          error: error.message,
        });
      }
    }

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    res.json({
      success: true,
      message: `Processed ${results.length} donations`,
      data: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        results,
      },
    });
  } catch (error) {
    console.error("Error in bulk email receipts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
