import axios from "axios";

const API_BASE_URL = "http://localhost:8080/rest/v1";
const AUTH_BASE_URL = "http://localhost:8080/auth";

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
// Hatanın sebebi buradaki "export" ifadesinin eksik olmasıydı
export const authApi = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

export default api;