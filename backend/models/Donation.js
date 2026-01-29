import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    campaignId: {type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true}, 
    donorId: {type: mongoose.Schema.Types.ObjectId, ref: 'Donor'},// I removed required to allow manual donations
    amount: {type: Number, required: true},
    isAnnonymous: {type: Boolean, default: false},
    isManual: {type: Boolean, default: false},
    method: {
        type: {type: String},
        identifier: {type: String},
    },
}, { timestamps: true });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;