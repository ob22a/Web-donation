import mongoose from "mongoose";
import User from "./User.js";

const ngoSchema = new mongoose.Schema({
  ngoName: { type: String },
  description: { type: String },
  category: { type: String },
  story: { type: String },
  bannerImage: { type: String },
});

// Discriminator
const NGO = User.discriminator("ngo", ngoSchema);

export default NGO;
