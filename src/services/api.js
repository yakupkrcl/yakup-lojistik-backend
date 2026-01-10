import axios from "axios";

// ARTIK LOCALHOST DEĞİL, RENDER ADRESLERİNİ KULLANIYORUZ
const API_BASE_URL = "https://yakup-lojistik-backend.onrender.com/rest/v1";
const AUTH_BASE_URL = "https://yakup-lojistik-backend.onrender.com/auth";

// 1. Genel API (Token gerektiren işlemler için)
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Auth API (Login/Register için - Token GEREKTİRMEZ)
export const authApi = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

export default api;