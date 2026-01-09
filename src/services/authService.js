import { authApi } from './api';

export const login = async (email, password) => {
    try {
        // En sade ve orijinal hali: Sadece email ve password
        const response = await authApi.post('/login', {
            email: email,
            password: password
        });
        
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
    } catch (error) {
        console.error("Login hatası:", error.response || error);
        throw error;
    }
};

export const register = async (userData) => {
    const response = await authApi.post('/register', userData);
    return response.data;
};