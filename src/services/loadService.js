import api from './api'; 

// 1. Şoför Metotları
export const getDriverLoads = async () => {
    const response = await api.get('/loads/driver/active-loads');
    return response.data;
};

// loadService.js içinde
export const getAllLoads = async () => {
    // '/loads/driver/available-loads' yerine Backend'deki ismi yazdık:
    const response = await api.get('/loads/driver/loads'); 
    return response.data;
};
export const updateLoadLocation = (loadId, lat, lng) => {
  return api.post(
    `/loads/${loadId}/update-location`,
    null,
    {
      params: { lat, lng }
    }
  );
};

export const confirmDeliveryWithCode = async (loadId, code) => {
    // Backend'de yazdığımız kodlu onay endpoint'ine istek atar
    const response = await api.put(`/loads/driver/complete-with-code/${loadId}`, null, {
        params: { kod: code } // Backend @RequestParam("kod") beklediği için params içinde gönderdik
    });
    return response.data;
};

export const updateLoadStatus = async (loadId, newStatus) => {
    // null yerine body gönderiyoruz
    const res = await api.put(`/loads/driver/update-status/${loadId}`, { durum: newStatus });
    return res.data;
};

// 2. Yük Sahibi (Shipper) Metotları
export const getShipperLoads = async () => {
    const response = await api.get('/loads/shipper/my-loads');
    return response.data;
};

export const getShipperCompletedLoads = async () => {
    const response = await api.get('/loads/shipper/completed-loads');
    return response.data;
};

export const createNewLoad = async (loadData) => {
    const response = await api.post('/loads/shipper/save', loadData);
    return response.data;
};

// 3. Genel ve Admin Metotları
export const getLoadDetails = async (loadId) => {
    const response = await api.get(`/loads/detail/${loadId}`);
    return response.data;
};

export const getAllLoadsByAdmin = async () => {
    const response = await api.get('/loads/admin/list-all'); 
    return response.data;
};

export const updateLoad = async (loadId, loadData) => {
    const response = await api.put(`/loads/${loadId}`, loadData); 
    return response.data;
};

export const deleteLoad = async (loadId) => {
    const response = await api.delete(`/loads/shipper/${loadId}`);
    return response.data;
};