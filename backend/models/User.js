import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["donor", "ngo"], default: "donor" },
    profilePicture: { type: String },
    // Common profile fields for both donors and NGOs
    phoneNumber: { type: String },
    city: { type: String },
    country: { type: String },
    secondaryEmail: { type: String },
  },
  { timestamps: true, discriminatorKey: "role" }
);

const User = mongoose.model("User", userSchema);
export default User;