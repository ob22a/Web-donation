import { VITE_APP_API_URI } from "./constants.js";

// GET {{base_url}}/ngo
export const getNGOs = async () => {
    const res = await fetch(`${VITE_APP_API_URI}/ngo`, {
        method: 'GET',
        credentials: "include"
    })
    return res.json()
}

//GET {{base_url}}/ngo/:id
export const getNGO = async (id) => {
    const res = await fetch(`${VITE_APP_API_URI}/ngo/${id}`, {
        method: 'GET',
        credentials: "include"
    })
    return res.json()
}

// PUT {{base_url}}/ngo
export const updateNGO = async (data) => {
    const res = await fetch(`${VITE_APP_API_URI}/ngo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include"
    })
    return res.json()
}


// POST {{base_url}}/ngo/banner/
export const uploadNgoBanner = async (formData) => {
    const res = await fetch(`${VITE_APP_API_URI}/ngo/banner/`, {
        method: 'POST',
        body: formData,
        credentials: "include"
    })

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload failed");
    }
    return res.json()
}