import mongoose from "mongoose";
import User from "./User.js";

const donorSchema = new mongoose.Schema({
  totalDonated: { type: Number, default: 0 },
  savedCampaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
  campaignsSupportedCount: { type: Number, default: 0 },
  preference: {
    emailReceipts: { type: Boolean, default: true },
    ngoUpdates: { type: Boolean, default: true },
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

// Discriminator
const Donor = User.discriminator("donor", donorSchema);

export default Donor;