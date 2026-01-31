import { VITE_APP_API_URI } from "./constants.js";

// POST {{base_url}}/campaigns/

export const createCampaign = async (data) => {
  const res = await fetch(`${VITE_APP_API_URI}/campaigns/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return res.json();
};

// GET {{base_url}}/campaigns/

export const getCampaigns = async () => {
  const res = await fetch(`${VITE_APP_API_URI}/campaigns/`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

// GET {{base_url}}/campaigns/:id

export const getCampaign = async (id) => {
  const res = await fetch(`${VITE_APP_API_URI}/campaigns/${id}`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

// GET {{base_url}}/campaigns/ngo/:ngoId
export const getCampaignsByNgo = async (ngoId) => {
  const res = await fetch(`${VITE_APP_API_URI}/campaigns/ngo/${ngoId}`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

// GET {{base_url}}/campaigns/all
export const getAllCampaignsSorted = async () => {
  const res = await fetch(`${VITE_APP_API_URI}/campaigns/all`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};
