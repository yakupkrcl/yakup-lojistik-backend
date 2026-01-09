
import api from './api';


export const createLocation = async (locationData) => {
    try {
        const response = await api.post('/locations/save', locationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getLocationById = async (id) => {
    try {
        const response = await api.get(`/locations/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lokasyon ID ${id} bulunamadı:`, error);
        return { city: "Bilinmiyor", country: "TR" }; 
    }
};

export const getAllLocations = async () => {
    try {
        const response = await api.get('/locations/list');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// // ----------------------------------------------------------------------
// // YENİ: Lokasyon Arama İşlevi (Autocomplete için)
// // Endpoint: GET /rest/v1/locations/search?query=...
// // ----------------------------------------------------------------------
// export const searchLocations = async (query) => {
//     // Sorgu boşsa veya çok kısaysa API çağrısı yapmaktan kaçınabiliriz.
//     if (!query || query.length < 2) {
//         return [];
//     }
//     try {
//         const response = await api.get(`/locations/search`, {
//             params: {
//                 query: query // URL'ye ?query=... olarak ekler
//             }
//         });
//         return response.data; // Eşleşen lokasyon listesi
//     } catch (error) {
//         console.error(`Lokasyon arama hatası: ${query}`, error);
//         throw error.response?.data || error;
//     }
// };