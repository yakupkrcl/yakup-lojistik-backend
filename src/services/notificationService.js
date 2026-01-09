import api from './api';

export const getMyNotifications = async (userId) => {
    try {
        const res = await api.get(`/notifications/my-notifications/${userId}`);
        return res.data;
    } catch (error) {
        console.error("Bildirimler alınamadı:", error);
        return [];
    }
};

export const markAsRead = async (notificationId) => {
    return await api.put(`/notifications/mark-as-read/${notificationId}`);
};