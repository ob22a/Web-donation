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

export const getProfile = async (req,res)=>{ // Donor info for setting and all pages
  try{
    const userId = req.user.userId;
    
    let user;
    if(req.user.role === 'donor') user = await Donor.findById(userId).select('-password');
    else user = await NGO.findById(userId).select('-password');

    if(!user) return sendJson(res,404,{message:'User not found'});

    sendJson(res,200,{user});
  }catch(err){
    sendJson(res,500,{message:'Server error'});
  }
}