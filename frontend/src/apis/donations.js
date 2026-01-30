import { VITE_APP_API_URI } from "./constants.js";

// POST {{base_url}}/donations
export const createDonation = async (data) => {
  const res = await fetch(`${VITE_APP_API_URI}/donations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return res.json();
};

// GET {{base_url}}/donations/my
export const getMyDonations = async () => {
  const res = await fetch(`${VITE_APP_API_URI}/donations/my`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

// GET {{base_url}}/donations/:campaignId
export const getDonationsByCampaign = async (campaignId, page = 1) => {
  const res = await fetch(
    `${VITE_APP_API_URI}/donations/${campaignId}?page=${page}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  return res.json();
};

// GET {{base_url}}/donations/ngo
export const getNGODonations = async () => {
  const res = await fetch(`${VITE_APP_API_URI}/donations/ngo`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

// POST {{base_url}}/donations/:id/email
export const emailDonationReceipt = async (donationId) => {
  const res = await fetch(`${VITE_APP_API_URI}/donations/${donationId}/email`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
};

// GET {{base_url}}/ngo/stats
export const getNGOStats = async () => {
  const res = await fetch(`${VITE_APP_API_URI}/ngo/stats`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};
