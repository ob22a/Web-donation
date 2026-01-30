import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import formidable from "formidable";

import User from "../models/User.js";
import Donor from "../models/Donor.js";
import NGO from "../models/NGO.js";
import { sendJson } from "../utils/response.js";
import { createAuthCookie } from "../utils/authCookies.js";
import cloudinary from "../config/cloudinary.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendJson(res, 400, { message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendJson(res, 404, { message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendJson(res, 401, { message: "Incorrect password" });
    }

    let fullUser;
    if (user.role === 'donor') {
      fullUser = await Donor.findById(user._id).select('-password');
    } else {
      fullUser = await NGO.findById(user._id).select('-password');
    }

    if (!fullUser) {
      return sendJson(res, 404, { message: "User profile not found" });
    }

    const token = jwt.sign(
      { userId: fullUser._id, name: fullUser.name, email: fullUser.email, role: fullUser.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    const cookie = createAuthCookie(token);

    const userObj = fullUser.toObject();
    delete userObj.password;

    sendJson(res, 200, {
      user: {
        ...userObj,
        id: userObj._id
      },
    }, [cookie]);

  } catch (err) {
    sendJson(res, 500, { message: "Server error" });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return sendJson(res, 400, { message: "All fields are required" });
    }

    if (!["donor", "ngo"].includes(role)) {
      return sendJson(res, 400, { message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendJson(res, 409, { message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "supasecretkey",
      { expiresIn: "7d" }
    );

    const cookie = createAuthCookie(token);

    sendJson(res, 201, {
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, [cookie]);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    let user;
    if (req.user.role === 'donor') user = await Donor.findById(userId).select('-password');
    else user = await NGO.findById(userId).select('-password');

    if (!user) return sendJson(res, 404, { message: 'User not found' });

    const userObj = user.toObject();
    delete userObj.password;

    sendJson(res, 200, {
      user: {
        ...userObj,
        id: userObj._id
      }
    });
  } catch (err) {
    console.error('getProfile error:', err);
    sendJson(res, 500, { message: 'Server error' });
  }
}


export const logout = async (req, res) => {
  try {
    sendJson(res, 200, { message: 'Logged out successfully' }, ["token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict"]);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { message: 'Server error' });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const data = req.body;

    let user;
    if (role === "donor") {
      user = await Donor.findById(userId);
    } else {
      user = await NGO.findById(userId);
    }

    if (!user) return sendJson(res, 404, { message: "User not found" });

    // General Fileds 
    const generalFields = ["name", "profilePicture", "secondaryEmail", "phoneNumber", "city", "country"];
    generalFields.forEach((field) => {
      if (data[field] !== undefined) user[field] = data[field];
    });

    // Role specific Fields
    if (role === "donor") {
      if (data.preference) {
        user.preference = { ...user.preference, ...data.preference };
      }

      if (data.recurringDonation) {
        user.recurringDonation = { ...user.recurringDonation, ...data.recurringDonation };
      }
      // Add new payment method if provided
      if (data.paymentMethods && data.newPaymentMethod) {
        const method = data.newPaymentMethod;
        if (method.type && method.identifier) {
          // If new method is default, unset all other defaults
          if (method.isDefault) {
            user.paymentMethods.forEach((pm) => (pm.isDefault = false));
          }
          user.paymentMethods.push(method);
        }
      }
    } else if (role === "ngo") {
      const ngoFields = ["ngoName", "category", "description", "story", "bannerImage"];
      ngoFields.forEach((field) => {
        if (data[field] !== undefined) user[field] = data[field];
      });
    }

    // 3. Password Update (requires old password verification)
    if (data.oldPassword && data.newPassword && data.confirmPassword) {
      const { oldPassword, newPassword, confirmPassword } = data;

      // Verify old password matches current password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return sendJson(res, 401, { message: "Old password is incorrect" });

      // Ensure new password and confirmation match
      if (newPassword !== confirmPassword) {
        return sendJson(res, 400, { message: "Passwords do not match" });
      }

      // Hash new password before storing
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // Return user object without password field
    const userObj = user.toObject({ virtuals: true });
    delete userObj.password;

    sendJson(res, 200, {
      message: "Profile updated successfully",
      user: { ...userObj, id: userObj._id },
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    sendJson(res, 500, { message: "Server error" });
  }
};

/**
 * Upload profile picture handler (works for both donors and NGOs).
 * 
 * Architecture: Uses formidable to parse multipart/form-data, then uploads
 * to Cloudinary for image hosting. Images are automatically resized/cropped
 * to 400x400 for consistency.
 * 
 * Flow:
 * 1. Parse multipart form data using formidable
 * 2. Extract profilePicture file from parsed files (handle array/single file)
 * 3. Upload to Cloudinary with transformations (resize/crop)
 * 4. Save secure URL to user document (works for both Donor and NGO discriminators)
 * 5. Return updated profile picture URL
 * 
 * File handling: Formidable may return files as arrays even with multiples: false.
 * We handle both cases to ensure compatibility. The file.filepath property contains
 * the temporary file path that Cloudinary needs.
 * 
 * Why Cloudinary: Provides automatic image optimization, CDN delivery,
 * and transformation capabilities without managing file storage infrastructure.
 */
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    // Fetch role-specific user document (Donor or NGO discriminator)
    let user;
    if (role === "donor") {
      user = await Donor.findById(userId);
    } else {
      user = await NGO.findById(userId);
    }

    if (!user) return sendJson(res, 404, { message: "User not found" });

    // Parse multipart/form-data (file upload)
    // Use same pattern as donorController for consistency
    const form = formidable({
      multiples: false,
      maxFileSize: 5 * 1024 * 1024 // max 5MB
    });

    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          console.error("Form parse error:", err);
          return sendJson(res, 400, { message: "File upload failed" });
        }

        // Handle both single file and array cases
        // Formidable may return file as array even with multiples: false
        const file = Array.isArray(files.profilePicture)
          ? files.profilePicture[0]
          : files.profilePicture;

        if (!file) {
          return sendJson(res, 400, { message: "No file uploaded" });
        }

        // Get filepath - formidable uses filepath property
        const filePath = file.filepath;
        if (!filePath) {
          console.error("File object missing filepath:", file);
          return sendJson(res, 400, { message: "Invalid file format" });
        }

        // Upload to Cloudinary with automatic resizing/cropping
        // Transformation ensures consistent 400x400 profile pictures
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "profile_pictures",
          transformation: [{ width: 400, height: 400, crop: "fill" }],
        });

        // Save secure URL (HTTPS) to user document
        user.profilePicture = result.secure_url;
        await user.save();

        sendJson(res, 200, {
          message: "Profile picture updated",
          profilePicture: result.secure_url,
        });
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        sendJson(res, 500, { message: "Image upload failed" });
      }
    });
  } catch (err) {
    console.error("uploadProfilePicture error:", err);
    sendJson(res, 500, { message: "Server error" });
  }
};