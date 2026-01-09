import api from './api';

const TRANSACTION_ENDPOINT = '/transactions';


// transactionService.js

export const getShipperTransactions = async () => {
    // 🚩 /rest/v1 kısmını sildik çünkü api.js zaten bunu ekliyor
    const response = await api.get('/transactions/my-transactions'); 
    return response.data;
};

export const getAllTransactions = async () => {
    // 🚩 Burayı da aynı şekilde temizle
    const response = await api.get('/transactions/all'); 
    return response.data;
};
 
export const getTransactionDetails = async (transactionId) => {
    try {
        const response = await api.get(`${TRANSACTION_ENDPOINT}/${transactionId}`);
        return response.data;
    } catch (error) {
        console.error(`İşlem detayları çekilirken hata (ID: ${transactionId}):`, error);
        throw error.response?.data || error;
    }
};

