import { VITE_APP_API_URI } from "./constants.js";


// POST {{base_url}}/donor/profile-picture/:id
export const uploadProfilePicture = async (donorId, formData) => {
  const res = await fetch(
    `${VITE_APP_API_URI}/donor/profile-picture/${donorId}`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Upload failed");
  }

  return res.json();
};

// PATCH {{base_url}}/api/donor/update/
// change setting properties ["name","profilePicture", "secondaryEmail", "phoneNumber", "city", "country", "preference"] and also password but for password oldpassword, newPassword and confirmPassword are needed and for
export const updateDonor = async (data) => {
  const res = await fetch(`${VITE_APP_API_URI}/donor/update/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: "include"
  })
  return res.json()
}