import { VITE_APP_API_URI } from "./constants.js";

export const updateProfile = async (data) => {
    const res = await fetch(`${VITE_APP_API_URI}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include"
    });
    return res.json();
};