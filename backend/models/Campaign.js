import mongoose from "mongoose";

/**
 * Campaign model schema.
 * 
 * Important: The 'ngo' field references 'User' model, not 'NGO', because
 * NGO is a discriminator of User. When using discriminators, Mongoose needs
 * the base model name for population. Both Donor and NGO are discriminators
 * of User, so we reference 'User' and Mongoose will correctly populate
 * based on the discriminator key.
 */
const campaignSchema = new mongoose.Schema({
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;