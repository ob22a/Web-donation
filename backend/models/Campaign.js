import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;