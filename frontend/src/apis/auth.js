import { VITE_APP_API_URI } from "./constants.js";

// {{base_url}}/auth/login data = email and password 

export const loginUser = async (data) => {
    const res = await fetch(`${VITE_APP_API_URI}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include"
    })
    return res.json()
}

// {{base_url}}/auth/register

export const registerUser = async (data) => {
    const res = await fetch(`${VITE_APP_API_URI}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include"
    })
    return res.json()
}

// GET {{base_url}}/auth/profile

export const getProfile = async () => {
    const res = await fetch(`${VITE_APP_API_URI}/auth/profile`, {
        method: 'GET',
        credentials: "include"
    })
    return res.json()
}

// POST {{base_url}}/auth/logout

export const logoutUser = async () => {
    const res = await fetch(`${VITE_APP_API_URI}/auth/logout`, {
        method: 'POST',
        credentials: "include"
    })
    return res.json()
}