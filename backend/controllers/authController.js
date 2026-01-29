import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Donor from "../models/Donor.js";
import NGO from "../models/NGO.js";
import { sendJson } from "../utils/response.js";
import { createAuthCookie } from "../utils/authCookies.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendJson(res, 400, { message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // ✅ Email does not exist
      return sendJson(res, 404, { message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // ✅ Email exists, but wrong password
      return sendJson(res, 401, { message: "Incorrect password" });
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    const cookie = createAuthCookie(token);

    sendJson(res, 200, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        memberSince: user.createdAt,
        role: user.role,
      },
    }, [cookie]);

  } catch (err) {
    sendJson(res, 500, { message: "Server error" });
  }
};

export const register = async (req, res) => { // handles both register and register as NGO both are users
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

    // Option A: just return userId
    // res.status(201).json({ message: "Registration successful", userId: user._id });

    // Option B (recommended): create a JWT and return it + userId so frontend can be logged in immediately
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "secretkey",
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

export const getProfile = async (req, res) => { // Donor info for setting and all pages
  try {
    const userId = req.user.userId;

    let user;
    if (req.user.role === 'donor') user = await Donor.findById(userId).select('-password');
    else user = await NGO.findById(userId).select('-password');

    if (!user) return sendJson(res, 404, { message: 'User not found' });

    const userObj = user.toObject({ virtuals: true });
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
    // remove auth from httpOnly cookie
    res.setHeader(
      "Set-Cookie",
      "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict"
    );
    sendJson(res, 200, { message: 'Logged out successfully' });
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

    // 1. General Fields (Common)
    const generalFields = ["name", "profilePicture", "secondaryEmail", "phoneNumber", "city", "country"];
    generalFields.forEach((field) => {
      if (data[field] !== undefined) user[field] = data[field];
    });

    // 2. Role-specific Fields
    if (role === "donor") {
      if (data.preference) {
        user.preference = { ...user.preference, ...data.preference };
      }
      if (data.paymentMethods && data.newPaymentMethod) {
        const method = data.newPaymentMethod;
        if (method.type && method.identifier) {
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

    // 3. Password Update
    if (data.oldPassword && data.newPassword && data.confirmPassword) {
      const { oldPassword, newPassword, confirmPassword } = data;

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return sendJson(res, 401, { message: "Old password is incorrect" });

      if (newPassword !== confirmPassword) {
        return sendJson(res, 400, { message: "Passwords do not match" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

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

export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let user;
    if (role === "donor") {
      user = await Donor.findById(userId);
    } else {
      user = await NGO.findById(userId);
    }

    if (!user) return sendJson(res, 404, { message: "User not found" });

    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return sendJson(res, 400, { message: "File upload failed" });
      }

      const file = files.profilePicture;
      if (!file) {
        return sendJson(res, 400, { message: "No file uploaded" });
      }

      try {
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: "profile_pictures",
          transformation: [{ width: 400, height: 400, crop: "fill" }],
        });

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