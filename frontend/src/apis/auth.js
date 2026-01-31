import { VITE_APP_API_URI } from "./constants.js";
// {{base_url}}/auth/login data = email and password
// POST {{base_url}}/auth/login
// Login user with email and password
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
// Upload profile picture for authenticated user (donor or NGO)
//
// Why this endpoint: Backend uses /api/auth/profile-picture which works for both
// donors and NGOs. The auth middleware extracts user ID from JWT token, so no
// need to pass user ID in the request.
export const uploadProfilePicture = async (formData) => {
  const res = await fetch(`${VITE_APP_API_URI}/auth/profile-picture`, {
    method: "POST",
    body: formData, // FormData with file - don't set Content-Type header (browser sets it with boundary)
    credentials: "include", // Include HttpOnly auth cookie
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Upload failed");
  }
  return res.json();
};
