import api from './api';

export const createOfferByDriver = async (offerData) => {
    const res = await api.post('/offers/driver/save', offerData);
    return res.data;
};

export const getAllOffersAdmin = async () => {
    try {
        const response = await api.get('/offers/list');
        return response.data;
    } catch (error) {
        console.error("Admin için tüm teklifler çekilirken hata:", error);
        throw error.response?.data || error;
    }
};

export const getMyOffers = async () => {
    const res = await api.get('/offers/driver/my-offers');
    return res.data;
};

export const startJourney = async (offerId) => {
    try {
        const res = await api.put(`/offers/driver/start-journey/${offerId}`, {}); 
        return res.data;
    } catch (error) {
        console.error("API Hatası:", error.response?.data);
        throw error;
    }
};

// 🔥 ÇAKIŞMAYI ÇÖZEN KISIM BURASI
// Artık hem kodlu hem kodsuz teslimat için tek metot!
export const completeOffer = async (offerId, deliveryCode = null) => {
    const config = deliveryCode ? { params: { kod: deliveryCode } } : {};
    const res = await api.put(`/offers/driver/complete/${offerId}`, null, config);
    return res.data;
};

// Geriye dönük uyumluluk için alias (DriverActiveLoads.jsx bunu bekliyor olabilir)
export const completeOfferWithCode = completeOffer;

export const getDriverOffers = getMyOffers;

export const getOffersByLoadId = async (loadId) => {
    const res = await api.get(`/offers/load/${loadId}`);
    return res.data;
};

// offerService.js
export const acceptOffer = async (offerId, paymentMethod = 'CUZDAN') => {
    // İkinci parametre BODY'dir. Backend payload.get("odemeYontemi") ile buradan okur.
    const res = await api.put(`/offers/shipper/accept/${offerId}`, { 
        odemeYontemi: paymentMethod 
    });
    return res.data;
};

export const rejectOffer = async (offerId) => {
    const res = await api.put(`/offers/shipper/reject/${offerId}`);
    return res.data;
};

export const getOfferById = async (id) => {
    const res = await api.get(`/offers/${id}`);
    return res.data;
};

export const deleteOffer = async (id) => {
    const res = await api.delete(`/offers/${id}`);
    return res.data;
};