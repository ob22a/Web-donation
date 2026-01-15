import { VITE_APP_API_URI } from "./constants.js";

// POST {{base_url}}/auth/login
export const loginUser = async (data) => {
  const res = await fetch(`${VITE_APP_API_URI}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return res.json();
};

// {{base_url}}/auth/register
export const registerUser = async (data) => {
  const res = await fetch(`${VITE_APP_API_URI}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return res.json();
};

// GET {{base_url}}/auth/profile
export const getProfile = async () => {
  const res = await fetch(`${VITE_APP_API_URI}/auth/profile`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

// POST {{base_url}}/auth/logout
export const logoutUser = async () => {
  const res = await fetch(`${VITE_APP_API_URI}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
};

// POST {{base_url}}/auth/profile-picture
export const uploadProfilePicture = async (formData) => {
  const res = await fetch(`${VITE_APP_API_URI}/auth/profile-picture`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Upload failed");
  }
  return res.json();
};
