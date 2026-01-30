import mongoose from "mongoose";

const recurringSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    amount: { type: Number, required: true },
    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
      default: "Monthly",
    },
    nextCharge: { type: Date },
    active: { type: Boolean, default: true },
    metadata: { type: Object },
  },
  { timestamps: true },
);

const RecurringDonation = mongoose.model("RecurringDonation", recurringSchema);

export default RecurringDonation;
