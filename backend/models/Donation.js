import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// I removed required to allow manual donations
    /**
     * donorName: Stores the display name for manual or guest donations.
     * Why: Allows NGOs to record names for offline donors while maintaining a null donorId.
     */
    donorName: { type: String },
    amount: { type: Number, required: true },
    isAnnonymous: { type: Boolean, default: false },
    isManual: { type: Boolean, default: false },
    method: {
        type: { type: String },
        identifier: { type: String },
    },
}, { timestamps: true });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;