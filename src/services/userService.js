import api from './api'; 

export const getAllUsers = async () => {
    try {
        const response = await api.get('/users/list'); 
        return response.data; 
    } catch (error) {
        console.error("Admin: Tüm kullanıcıları çekerken hata:", error);
        throw error.response?.data || error;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/users/${id}`); 
        return response.data;
    } catch (error) {
        console.error(`ID ${id} olan kullanıcıyı çekerken hata:`, error);
        throw error.response?.data || error;
    }
};

export const updateUserRole = async (userId, newRole) => {
    try {
        const response = await api.put(`/users/${userId}`, { 
            userType: newRole 
        });
        return response.data;
    } catch (error) {
        console.error(`Kullanıcı ID ${userId} rolü güncellenirken hata:`, error);
        throw error.response?.data || error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        return response.data; 
    } catch (error) {
        console.error(`Kullanıcı ID ${userId} silinirken hata:`, error);
        throw error.response?.data || error;
    }
};

// 🌟 İşte cüzdanı ve diğer sayfaları kurtaracak olan o kritik ekleme:
export const getUserProfile = async () => {
    try {
        // Zaten api örneğin (axios) içinde muhtemelen token ekleme mantığı vardır, 
        // direkt get atıyoruz:
        const response = await api.get('/users/profile');
        return response.data; 
    } catch (error) {
        console.error("Profil bilgileri alınırken hata:", error);
        throw error.response?.data || error;
    }
};