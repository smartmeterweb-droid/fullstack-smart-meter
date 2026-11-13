import axios from 'axios'

export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4885"

// Create Axios instance
const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

// Automatically add token to every request if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
