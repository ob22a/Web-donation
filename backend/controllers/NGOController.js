// GET to get all NGOs
// PUT to update NGO information both for the initial modal and All donations Page
// GET /:id to get specific NGO information

import NGO from "../models/NGO.js";
import { sendJson } from "../utils/response.js";
import formidable from "formidable";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

// I accidentally did these 2 😅
export async function getAllNGOs(req, res) {
  try {
    // Logic to get all NGOs from the database
    const ngos = await NGO.find({ role: 'NGO' });
    sendJson(res, 200, { ngos });
  } catch (err) {
    console.error('Error fetching NGOs:', err);
    sendJson(res, 500, { message: 'Internal Server Error' });
  }
}

export async function getNGOById(req, res) {
  try {
    const segments = req.url.split("?")[0].split("/").filter(Boolean);
    const id = segments[2]; // beacause the route is api/ngo/:id
    if (mongoose.Types.ObjectId.isValid(id) === false) return sendJson(res, 400, { message: 'Invalid NGO ID' });
    const ngo = await NGO.findById(id);
    sendJson(res, 200, { ngo });
  } catch (err) {
    console.error('Error fetching NGO:', err);
    sendJson(res, 500, { message: 'Internal Server Error' });
  }
}

export async function updateNGO(req, res) {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0 || !data.name || !data.category || !data.description) {
      return sendJson(res, 400, { message: 'All fields are required' });
    }
    const id = req.user.userId; // from auth middleware
    if (!mongoose.Types.ObjectId.isValid(id)) return sendJson(res, 400, { message: 'Invalid NGO ID' });

    const updatedNGO = await NGO.findByIdAndUpdate(id, data, { new: true });
    if (!updatedNGO) {
      return sendJson(res, 404, { message: 'NGO not found' });
    }
    const updatedNGOObj = updatedNGO.toObject({ virtuals: true });
    sendJson(res, 200, { updatedNGO: { ...updatedNGOObj, id: updatedNGOObj._id } });
  } catch (err) {
    console.error('Error updating NGO:', err);
    sendJson(res, 500, { message: 'Internal Server Error' });
  }
}

export const uploadNgoBanner = async (req, res) => {
  const form = formidable({
    multiples: false,
    maxFileSize: 4 * 1024 * 1024, // 4 MB limit
  });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        return sendJson(res, 400, { message: "Invalid file upload" });
      }

      const id = req.user.userId
      if (!mongoose.Types.ObjectId.isValid(id)) return sendJson(res, 400, { message: "Invalid NGO ID" });
      const ngo = await NGO.findById(id);

      if (!ngo) {
        return sendJson(res, 404, { message: "NGO not found" });
      }

      const file = Array.isArray(files.bannerImage) ? files.bannerImage[0] : files.bannerImage;
      if (!file) return sendJson(res, 400, { message: "No banner image provided" });

      const filePath = file.filepath;

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: "ngos/banners",
        public_id: `ngo_banner_${ngo._id}`,
        overwrite: true,
      });

      ngo.bannerImage = uploadResult.secure_url;
      await ngo.save();

      sendJson(res, 200, {
        message: "NGO banner updated successfully",
        bannerImage: uploadResult.secure_url,
      });
    } catch (error) {
      console.error("NGO banner upload error:", error);
      sendJson(res, 500, { message: "Internal server error" });
    }
  });
};