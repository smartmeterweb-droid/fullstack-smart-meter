import axios from 'axios'

const rawApiUrl = import.meta.env.VITE_API_URL
const isProd = import.meta.env.PROD

// In production (Vercel), never allow localhost (which causes mixed-content / unreachable errors)
export const BACKEND_URL =
    (isProd && (!rawApiUrl || rawApiUrl.includes('localhost')))
        ? 'https://fullstack-smart-meter.onrender.com'
        : (rawApiUrl || 'http://localhost:4885')

// Create Axios instance
const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 45000 // 45 seconds to accommodate Render free-tier cold starts
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
