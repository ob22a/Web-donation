import bcrypt from "bcryptjs";
import Donor from "../models/Donor.js";
import { sendJson } from "../utils/response.js";
import cloudinary from "../config/cloudinary.js";
import formidable from "formidable";

export const getDonor = async (req, res) => {
  try {
    const { id } = req.params;

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

    const generalFields = [
      "name",
      "profilePicture",
      "secondaryEmail",
      "phoneNumber",
      "city",
      "country",
      "preference",
      "recurringDonation",
    ];
    generalFields.forEach((field) => {
      if (data[field] !== undefined) donor[field] = data[field];
    });

    if (data.paymentMethods) {
      const method = data.newPaymentMethod;

      if (!method.type || !method.identifier)
        return sendJson(res, 400, {
          message: "Payment method must include type and identifier",
        });

      if (method.isDefault) {
        donor.paymentMethods.forEach((pm) => (pm.isDefault = false));
      }
      donor.paymentMethods.push(method);
    }

    if (data.oldPassword || data.newPassword || data.confirmPassword) {
      const { oldPassword, newPassword, confirmPassword } = data;

      if (!oldPassword || !newPassword || !confirmPassword) {
        return sendJson(res, 400, {
          message: "All password fields are required",
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, donor.password);
      if (!isMatch)
        return sendJson(res, 401, { message: "Old password is incorrect" });

      if (newPassword !== confirmPassword) {
        return sendJson(res, 400, {
          message: "New password and confirm password do not match",
        });
      }

      donor.password = await bcrypt.hash(newPassword, 10);
    }

    await donor.save();

    const donorResponse = donor.toObject({ virtuals: true });
    delete donorResponse.password;

    sendJson(res, 200, {
      message: "Profile updated successfully",
      donor: { ...donorResponse, id: donorResponse._id },
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

      const { id } = req.params;
      const donor = await Donor.findById(id);
      if (!donor) return sendJson(res, 404, { message: "Donor not found" });

      if (req.user?.userId !== donor._id.toString()) {
        return sendJson(res, 403, { message: "Forbidden" });
      }

      const file = Array.isArray(files.profilePicture)
        ? files.profilePicture[0]
        : files.profilePicture;
      if (!file) {
        return sendJson(res, 400, { message: "No file uploaded" });
      }

      const filePath = file.filepath;

      const result = await cloudinary.uploader.upload(filePath, {
        folder: "donors/profile_pictures",
        public_id: `donor_${donor._id}`,
        overwrite: true,
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "auto" },
          { fetch_format: "auto", quality: "auto" },
        ],
      });

      donor.profilePicture = result.secure_url;
      await donor.save();

      sendJson(res, 200, {
        message: "Profile picture uploaded",
        profilePicture: result.secure_url,
      });
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { message: "Server error" });
    }
  });
};
