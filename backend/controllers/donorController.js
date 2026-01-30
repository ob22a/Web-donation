// I added sendJson utility to avoid redundancy but This is still meant for express some chanages are needed like in req.params
// This is copied directly from your codebase biruktie except for upload profile 
// I updated updateProfile as well I forgot it was my part and I noticed that getDonor is kinda implemented in authController profile route

import bcrypt from "bcryptjs";
import Donor from "../models/Donor.js";
import { sendJson } from "../utils/response.js";
import cloudinary from '../config/cloudinary.js';
import formidable from "formidable";

// I'm not certain but I think profile in auth handles this Biruktie 
// GET /api/donor/:id
export const getDonor = async (req, res) => {
  try {
    const { id } = req.params;

    // Optionally ensure the requester is the same user
    if (req.user?.userId !== id && req.user?.role !== "admin") {
      return sendJson(res, 403, { message: "Forbidden" });
    }

    const user = await Donor.findById(id).select("-password");
    if (!user) return sendJson(res, 404, { message: "Donor not found" });
    if (user.role !== "donor")
      return sendJson(res, 400, { message: "Not a donor account" });

    sendJson(res, 200, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    sendJson(res, 500, { message: "Server error" });
  }
};

export const updateDonor = async (req, res) => {
  try {
    const id = req.user.userId;
    const data = req.body;

    const donor = await Donor.findById(id);
    if (!donor) return sendJson(res, 404, { message: "Donor not found" });
    if (donor.role !== "donor")
      return sendJson(res, 400, { message: "Not a donor account" });

    // ---- 1. Update general fields ----
    // Why: Allows the donor to update their profile info, notification preferences, 
    // and new recurring donation settings (replacing static frontend state).
    const generalFields = ["name", "profilePicture", "secondaryEmail", "phoneNumber", "city", "country", "preference", "recurringDonation"];
    generalFields.forEach(field => {
      if (data[field] !== undefined) donor[field] = data[field];
    });

    // ---- 2. Update payment methods ----
    if (data.paymentMethods) {
      const method = data.newPaymentMethod;

      if (!method.type || !method.identifier) return sendJson(res, 400, { message: "Payment method must include type and identifier" });

      // Optional: ensure only one default
      if (method.isDefault) {
        donor.paymentMethods.forEach(pm => pm.isDefault = false);
      }
      donor.paymentMethods.push(method);

    }

    // ---- 3. Update password ----
    if (data.oldPassword || data.newPassword || data.confirmPassword) {
      const { oldPassword, newPassword, confirmPassword } = data;

      if (!oldPassword || !newPassword || !confirmPassword) {
        return sendJson(res, 400, { message: "All password fields are required" });
      }

      const isMatch = await bcrypt.compare(oldPassword, donor.password);
      if (!isMatch) return sendJson(res, 401, { message: "Old password is incorrect" });

      if (newPassword !== confirmPassword) {
        return sendJson(res, 400, { message: "New password and confirm password do not match" });
      }

      donor.password = await bcrypt.hash(newPassword, 10);
    }

    // Save the updated donor
    await donor.save();

    // Remove password from response
    const donorResponse = donor.toObject({ virtuals: true });
    delete donorResponse.password;

    sendJson(res, 200, {
      message: "Profile updated successfully",
      donor: { ...donorResponse, id: donorResponse._id }
    });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { message: "Server error" });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 }); // max 5MB

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) return sendJson(res, 400, { message: "Invalid file upload" });

      const { id } = req.params; // donor id added in the routes manually 
      const donor = await Donor.findById(id);
      if (!donor) return sendJson(res, 404, { message: "Donor not found" });

      // Check auth
      if (req.user?.userId !== donor._id.toString()) {
        return sendJson(res, 403, { message: "Forbidden" });
      }

      const file = Array.isArray(files.profilePicture) ? files.profilePicture[0] : files.profilePicture;
      if (!file) {
        return sendJson(res, 400, { message: "No file uploaded" });
      }

      const filePath = file.filepath;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "donors/profile_pictures",
        public_id: `donor_${donor._id}`,
        overwrite: true,
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "auto" },
          { fetch_format: "auto", quality: "auto" },
        ],
      });

      // Save the secure URL in DB
      donor.profilePicture = result.secure_url;
      await donor.save();

      sendJson(res, 200, { message: "Profile picture uploaded", profilePicture: result.secure_url });
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { message: "Server error" });
    }
  });
};
//hello hello look who is here

// Wazzapp
// wazzapppppp how u doing
// chilling as usual
// just clicking buttons and watching reels
// i was watching reels too but my ntk is not letting me procrastinate
// It's a hater
// Btw my auto complte is finishing your sentences and it is hillarious
// same here bro😂
// it is complementing itself

// I let it finish this message from now on

// yeah bro it is like it is trying to be part of the conversation
// true that
// bro what if it becomes sentient one day
// and starts having its own opinions
// imagine debating with your IDE
// that would be wild
// "I think your code could be more efficient"
// "No, I think it's fine"
// why is mine not working ughh
// maybe it is tired of me ignoring it
// give it a break bro
// yeah maybe I should take it for a walk
// lol a walk for an IDE
// maybe a virtual walk
// through some well-structured code
// that would be nice
// a nice clean repo with good documentation
// dreams bro dreams

// Esu new eyekebatere yalew
// extensionu endale check argi esti
// which one is working ante gar
// ene gar copilot bcha meselegn yalew
// ahh copilot yechekebetere new -> I don't even know what that means yeah ene garem esu nw
// wth is yechebetere
// it was trying amharic too
// i was gonna say atleast he can't finish amharic convo
// yeah i was trying too see how much it would go amharic gn ayseram
// i heard habeshas can't say the n word
// u can't 😁
// wendeme grok mnamenen eyetefelasefebachew yefelegewen neger endilu asbeluachewal
// bomb endet endemisera banned words mnamn
// keza ezaw gaslight yargachew why are you not following your rules mnamn eyale
// you just gave me sth to end the world how dare you
// that was what he was doing keza rasun lemadan AIu mekeraker yejemeral mnamn
// i felt like we were medebadebing with the scrolling
// I didn't think anchim gar scroll endemiareg
// it was so funny getan record mareg neberebgn
// anyways i had a good laugh lemme get back to work ahun beka
// Ight adios