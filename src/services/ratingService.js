// ratingService.js
import api from './api'; // Hazırladığın interceptor'lı yapıyı import et!

export const saveRating = async (ratingData) => {
    // URL'in başına artık http... yazmana gerek yok, api.js baseURL'i biliyor
    const response = await api.post("/ratings/save", ratingData); 
    return response.data;
};

export const getAllRatings = async () => {
    try {
        const response = await api.get("/ratings/list");
        return response.data;
    } catch (error) {
        console.error("Puanlar çekilirken hata oluştu:", error);
        throw error;
    }
};

// Belirli bir kullanıcının (şoförün) aldığı tüm yorumları ve puanları getirir
export const getDriverRatings = async (driverId) => {
    const response = await api.get(`/ratings/${driverId}`);
    return response.data; // [{puan: 5, yorum: "Hızlı teslimat", ...}, ...]
};

export const getAverageRating = async (userId) => {
    // URL'deki çift ":" hatasını engellemek için userId kontrolü
    if (!userId) return 0;
    const response = await api.get(`/ratings/average/${userId}`);
    return response.data;
};