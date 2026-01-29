// Biruktie you might add more controllers based on the functionalities from the donor 

import Campaign from "../models/Campaign.js";
import NGO from "../models/NGO.js";
import { sendJson } from "../utils/response.js";

export async function createCampaign(req, res) {
    try {
        const data = req.body;
        // title, description, targetAmount, initialAmount, status, ngo
        const ngoId = req.user.userId;
        const newCampaign = new Campaign({
            ngo: ngoId,
            ...data
        });
        await newCampaign.save();
        sendJson(res, 201, { campaign: newCampaign });
    } catch (err) {
        console.error('Error creating campaign:', err);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
}

export async function getCampaignsByNGO(req, res) {
    try {
        const ngoId = req.user.userId;
        const campaigns = await Campaign.find({ ngo: ngoId }).populate('ngo', 'ngoName bannerImage');
        sendJson(res, 200, { campaigns });
    } catch (err) {
        console.error('Error fetching campaigns:', err);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
}

export async function getAllCampaigns(req, res) {
    try {
        const campaigns = await Campaign.find({ status: 'active' }).populate('ngo', 'ngoName bannerImage');
        sendJson(res, 200, { campaigns });
    } catch (err) {
        console.error('Error fetching all campaigns:', err);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
}

export async function getCampaignById(req, res) {
    try {
        const segments = req.url.split("?")[0].split("/").filter(Boolean);
        const campaignId = segments.at(-1);

        const campaign = await Campaign.findById(campaignId).populate('ngo', 'ngoName bannerImage description');
        if (!campaign) {
            return sendJson(res, 404, { message: 'Campaign not found' });
        }
        sendJson(res, 200, { campaign });
    } catch (err) {
        console.error('Error fetching campaign:', err);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
}

export async function getCampaignsByNGOId(req, res) {
    try {
        const segments = req.url.split("?")[0].split("/").filter(Boolean);
        const ngoId = segments.at(-1);

        const campaigns = await Campaign.find({ ngo: ngoId });
        sendJson(res, 200, { campaigns });
    } catch (err) {
        console.error('Error fetching campaigns for NGO:', err);
        sendJson(res, 500, { message: 'Internal Server Error' });
    }
}

// 🥳
// It's special  skill  😁
// win + v
// 🔝 here use this join the club
// Let's keep all this for the teacher 😂😂
// it's settled I'm commiting this file I guess it is too late for that 😁
// Sure sure beka distract alaregeshem
// Essay etsefeleshalew dw ... Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
// AI is also suggesting me conversation it is no longer coding assistant
// Okay back to work I know that I won't get back to it if I don't start now 😂
// 💪
// finally
// how can you use emojis here
// and ken tesasto metolgn neber idk what i clicked
// okay enough with the brag haha(i would use a laughing emoji if i knew how to)
// 😂😂yessssssssssss
// that would be so hilarious 100 neber mnagegnew
// what if he doesn't have a humor we will be cooked
// let's get back to work anteee i haven't done anything ekoo
// smeles manebew neger tsfeh tebkegn
//😂😂i wasn't expecting that
// go ai
// lock in time


// We did it we made it we are champions
// I belive that when you see this we are probably done with the project 😁