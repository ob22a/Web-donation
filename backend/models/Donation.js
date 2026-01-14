import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "donor", // small case to match the discriminator 
    }, // I removed required to allow manual donations
    donorName: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    isAnnonymous: {
      type: Boolean,
      default: false,
    },
    isManual: {
      type: Boolean,
      default: false,
    },
    // Whether a receipt email has been sent to the donor
    receiptEmailSent: {
      type: Boolean,
      default: false,
    },
    receiptSentAt: {
      type: Date,
    },
    method: {
      type: {
        type: String,
      },
      identifier: {
        type: String,
      },
    },
  },
  { timestamps: true },
);

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
