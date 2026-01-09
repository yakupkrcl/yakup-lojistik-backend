import api from './api';

// Kullanıcıları Listele
export const getAllUsers = async () => {
    const response = await api.get('/users/list'); 
    return response.data; 
};

// Kullanıcı Sil
export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data; 
};

// KULLANICI ROLÜ GÜNCELLE (Hata aldığımız yer - Orijinal Payload)
export const updateUserRole = async (userId, newRole) => {
    const payload = { newRole: newRole };
    const response = await api.put(`/users/${userId}`, payload); 
    return response.data; 
};

// Yüklerin Hepsini Listele
export const getAllLoadsByAdmin = async () => {
    const response = await api.get('/loads/admin/list-all');
    return response.data;
};

// Yük Durumu Güncelle
export const updateLoadStatus = async (loadId, status) => {
    const response = await api.put(`/loads/admin/${loadId}/status`, { durum: status });
    return response.data;
};