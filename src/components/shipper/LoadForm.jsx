// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import * as loadService from '../../services/loadService';
// import { useAuth } from '../../context/AuthContext';
// import styles from './LoadForm.module.css';

// // DtoLoadIU'ya uygun initial state
// const initialLoadState = {
//     kalkisAdresiId: '',
//     varisAdresiId: '',
//     yukDetaylari: {
//         malzemeTuru: '',
//         agirlikKg: '',
//         hacimM3: '',
//     },
//     teklifEdilenFiyat: '',
//     teslimTarihi: '',
//     durum: 'YAYINDA',
// };

// const LoadForm = ({ isEditMode = false }) => {
//     const { loadId } = useParams();
//     const navigate = useNavigate();
//     const { user } = useAuth();

//     const [formData, setFormData] = useState(initialLoadState);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     // Düzenleme modunda yük verisini çek
//     useEffect(() => {
//         if (isEditMode && loadId) {
//             const fetchLoad = async () => {
//                 setLoading(true);
//                 try {
//                     const load = await loadService.getLoadDetails(loadId);

//                     setFormData({
//                         kalkisAdresiId: load.kalkisAdresiId || '',
//                         varisAdresiId: load.varisAdresiId || '',
//                         yukDetaylari: load.yukDetaylari || initialLoadState.yukDetaylari,
//                         teklifEdilenFiyat: load.teklifEdilenFiyat || 0,
//                         teslimTarihi: load.teslimTarihi
//                             ? new Date(load.teslimTarihi).toISOString().split('T')[0]
//                             : '',
//                         durum: load.durum || 'YAYINDA',
//                     });
//                 } catch (err) {
//                     setError('Yük detayları yüklenirken hata oluştu.');
//                     console.error(err);
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             fetchLoad();
//         }
//     }, [isEditMode, loadId]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         if (['malzemeTuru', 'agirlikKg', 'hacimM3'].includes(name)) {
//             setFormData(prev => ({
//                 ...prev,
//                 yukDetaylari: {
//                     ...(prev.yukDetaylari || initialLoadState.yukDetaylari),
//                     [name]: name === 'agirlikKg' || name === 'hacimM3' ? Number(value) : value,
//                 },
//             }));
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: name === 'teklifEdilenFiyat' ? Number(value) : value,
//             }));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError(null);

//         try {
//             const finalData = {
//                 ...formData,
//                 yukSahibiId: user?._id,
//             };

//             if (isEditMode) {
//                 await loadService.updateLoad(loadId, finalData);
//                 alert('Yük başarıyla güncellendi!');
//             } else {
//                 await loadService.createNewLoad(finalData);
//                 alert('Yeni yük başarıyla yayınlandı!');
//             }

//             navigate('/shipper/loads');
//         } catch (err) {
//             setError(isEditMode
//                 ? 'Yük güncellenemedi. Lütfen tüm alanları kontrol edin.'
//                 : 'Yük oluşturulamadı.');
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading && isEditMode) return <div>Yük detayları yükleniyor...</div>;

//     return (
//         <div className={styles.loadFormContainer}>
//             <h2>{isEditMode ? 'Yük Düzenle' : 'Yeni Yük Oluştur'}</h2>

//             {error && <div className={styles.error}>{error}</div>}

//             <form onSubmit={handleSubmit}>
//                 <fieldset>
//                     <legend>Konum Bilgileri</legend>
//                     <div>
//                         <label htmlFor="kalkisAdresiId">Kalkış Adresi</label>
//                         <input
//                             type="text"
//                             id="kalkisAdresiId"
//                             name="kalkisAdresiId"
//                             value={formData.kalkisAdresiId}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="varisAdresiId">Varış Adresi</label>
//                         <input
//                             type="text"
//                             id="varisAdresiId"
//                             name="varisAdresiId"
//                             value={formData.varisAdresiId}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                 </fieldset>

//                 <fieldset>
//                     <legend>Yük Detayları</legend>
//                     <div>
//                         <label htmlFor="malzemeTuru">Malzeme Türü</label>
//                         <input
//                             type="text"
//                             id="malzemeTuru"
//                             name="malzemeTuru"
//                             value={formData.yukDetaylari.malzemeTuru}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="agirlikKg">Ağırlık (Kg)</label>
//                         <input
//                             type="number"
//                             id="agirlikKg"
//                             name="agirlikKg"
//                             value={formData.yukDetaylari.agirlikKg}
//                             onChange={handleChange}
//                             min="0"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="hacimM3">Hacim (m³)</label>
//                         <input
//                             type="number"
//                             id="hacimM3"
//                             name="hacimM3"
//                             value={formData.yukDetaylari.hacimM3}
//                             onChange={handleChange}
//                             min="0"
//                             required
//                         />
//                     </div>
//                 </fieldset>

//                 <fieldset>
//                     <legend>Fiyat ve Teslimat</legend>
//                     <div>
//                         <label htmlFor="teklifEdilenFiyat">Teklif Edilen Fiyat (TL)</label>
//                         <input
//                             type="number"
//                             id="teklifEdilenFiyat"
//                             name="teklifEdilenFiyat"
//                             value={formData.teklifEdilenFiyat}
//                             onChange={handleChange}
//                             min="0"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="teslimTarihi">Hedef Teslimat Tarihi</label>
//                         <input
//                             type="date"
//                             id="teslimTarihi"
//                             name="teslimTarihi"
//                             value={formData.teslimTarihi}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                 </fieldset>

//                 <button type="submit" disabled={loading}>
//                     {loading ? 'İşleniyor...' : (isEditMode ? 'Yükü Güncelle' : 'Yükü Yayınla')}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default LoadForm;
