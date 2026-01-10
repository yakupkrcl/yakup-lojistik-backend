import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';
import api from '../services/api';
import axios from 'axios';

const AuthContext = createContext();

// Güvenli JSON parse işlemi
const safeParse = (value) => {
    try {
        return value ? JSON.parse(value) : null;
    } catch (e) {
        console.error("USER PARSE HATASI: Bozuk LocalStorage verisi", e);
        localStorage.removeItem('user');
        return null;
    }
};

// Backend'den gelen karmaşık user/token verisini normalize eder
const parseAuthData = (response) => {
    const actualData = response?.data || response;
    const token = actualData?.token || actualData?.accessToken || actualData?.access_token;
    const userSource = actualData?.user || actualData;
    const rawRole = userSource?.userType || userSource?.role || userSource?.type;

    let roleStr = Array.isArray(rawRole) ? rawRole.find(r => typeof r === 'string') : rawRole;

    const normalizeRole = (r) => {
        if (!r) return null;
        const s = String(r).toLowerCase();
        if (s.includes('yuk') || s.includes('sahibi')) return 'YUK_SAHIBI';
        if (s.includes('tasi') || s.includes('driver')) return 'TASIYICI';
        if (s.includes('admin')) return 'ADMIN';
        return String(r).toUpperCase();
    };

    const user = {
        id: userSource?.id,
        ad: userSource?.ad || userSource?.firstName || userSource?.name,
        soyad: userSource?.soyad || userSource?.lastName,
        email: userSource?.email,
        userType: normalizeRole(roleStr),
        aktif: userSource?.aktif,
        sirketAdi: userSource?.sirketAdi || userSource?.companyName,
        vergiNumarasi: userSource?.vergiNumarasi,
        telefon: userSource?.telefon || userSource?.phone,
    };

    if (!token || !user.userType || !user.id) {
        console.error("API Yanıtı Eksik:", { actualData, user });
        return null;
    }

    return { token, user };
};

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Uygulama ilk açıldığında localStorage kontrolü
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = safeParse(localStorage.getItem('user'));

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(storedUser);
            setIsAuthenticated(true);
            
            let raw = storedToken.replace(/^Bearer\s+/i, '');
            api.defaults.headers.common['Authorization'] = `Bearer ${raw}`;
        }
        setIsLoading(false);
    }, []);

    const logout = () => {
        localStorage.clear(); // Tüm cache'i temizle (Cüzdan sızıntısını önler)
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        try {
            delete api.defaults.headers.common['Authorization'];
        } catch (e) {}
        window.location.href = '/login'; // State'leri tamamen sıfırlamak için hard redirect
    };

    const refreshUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

           const res = await axios.get("https://yakup-lojistik-backend.onrender.com/auth/me", {
                headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, '')}` }
            });

            if (res.data && user?.aktif !== res.data.aktif) {
                const updatedUser = { ...user, ...res.data };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error("Profil tazelenemedi:", err);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            const authData = parseAuthData(response);

            if (authData) {
                localStorage.setItem('token', authData.token);
                localStorage.setItem('user', JSON.stringify(authData.user));

                setToken(authData.token);
                setUser(authData.user);
                setIsAuthenticated(true);

                let raw = authData.token.replace(/^Bearer\s+/i, '');
                api.defaults.headers.common['Authorization'] = `Bearer ${raw}`;

                return authData.user.userType;
            }
            throw new Error("Giriş verisi eksik.");
        } catch (error) {
            console.error("Login hatası:", error);
            logout();
            throw error;
        }
    };

    const register = async (userData, autoLogin = true) => {
        await authService.register(userData);
        if (autoLogin) return await login(userData.email, userData.password);
        return null;
    };

    // TASIYICI Onay Takibi (Polling)
    useEffect(() => {
        let interval;
        if (isAuthenticated && user?.userType === 'TASIYICI' && !user?.aktif) {
            interval = setInterval(() => refreshUser(), 10000);
        }
        return () => interval && clearInterval(interval);
    }, [isAuthenticated, user?.aktif, user?.userType]);

    // Global Unauthorized (401) Dinleyici
    useEffect(() => {
        const handleUnauthorized = () => logout();
        window.addEventListener('unauthorized', handleUnauthorized);
        return () => window.removeEventListener('unauthorized', handleUnauthorized);
    }, []);

    const value = {
        token,
        user,
        isAuthenticated,
        userRole: user?.userType || null,
        login,
        logout,
        register,
        refreshUser,
        isAuthorized: (allowedRoles) => isAuthenticated && allowedRoles.includes(user?.userType),
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);