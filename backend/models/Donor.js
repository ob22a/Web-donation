import mongoose from "mongoose";
import User from "./User.js";

const donorSchema = new mongoose.Schema({
  totalDonated: { type: Number, default: 0 },
  savedCampaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
  campaignsSupportedCount: { type: Number, default: 0 },
  badges: [{ type: String }],
  recurringDonation: {
    enabled: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "monthly" }
  },
  preference: {
    emailReceipts: { type: Boolean, default: true },
    ngoUpdates: { type: Boolean, default: true },
    notifyExpiringCards: { type: Boolean, default: true },
  },
  paymentMethods: [
    {
      type: {
        type: String,
        enum: ["Telebirr", "CBE", "Awash Bank", "Abyssinia Bank", "Zemen Bank"],
        required: true,
      },
      identifier: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    },
  ],
});

const Donor = User.discriminator("donor", donorSchema);

export default Donor;