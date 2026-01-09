import api from "./api";

/**
 * ADMIN -> tüm belgeleri getir
 */
export const getAllDocuments = async () => {
  // ?t= ekleyerek tarayıcının cache yapmasını engelliyoruz
  const res = await api.get(`/documents?t=${new Date().getTime()}`);
  return res.data;
};

/**
 * DRIVER -> belge yükle
 */
export const uploadDriverDocument = async (file, belgeTipi) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("belgeTipi", belgeTipi);

    const response = await api.post("/documents/driver/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

/**
 * ADMIN -> belge onay / red
 * HATA BURADAYDI: Endpoint "/admin-status" olmalı ve status RequestParam olarak gitmeli.
 */
export const updateDocumentStatus = async (documentId, status) => {
  const res = await api.put(
    `/documents/${documentId}/admin-status`, 
    null, // Body boş
    { params: { status } } // Backend @RequestParam bekliyor
  );
  return res.data;
};
// Örnek: Kullanıcının yüklediği belgelerin durumunu getirir
export const getDriverDocuments = async () => {
    const response = await api.get("/documents/my-documents"); // Controller'daki RequestMapping + yeni metod
    return response.data; 
};