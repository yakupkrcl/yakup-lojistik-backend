import { useEffect, useState } from 'react';
import * as loadService from '../../services/loadService';
import * as ratingService from '../../services/ratingService';
import ToastManager from '../../components/common/ToastManager'; 
import './ShipperCompletedLoads.css';
import { useNavigate, useLocation } from 'react-router-dom';

function ShipperCompletedLoads() { 
    const navigate = useNavigate();
    const location = useLocation();
    const [loads, setLoads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLoad, setSelectedLoad] = useState(null);
    const [ratingData, setRatingData] = useState({ puan: 5, yorum: "" });
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    useEffect(() => {
        fetchCompletedLoads();
    }, []);

    useEffect(() => {
        if (loads.length > 0 && location.state?.autoOpenRating) {
            const loadToRate = loads.find(l => l.id === location.state.loadId);
            if (loadToRate && !loadToRate.isRated) {
                handleOpenModal(loadToRate);
            }
        }
    }, [loads, location.state]);

    const fetchCompletedLoads = async () => {
        try {
            setIsLoading(true);
            const response = await loadService.getShipperCompletedLoads();
            const sortedData = Array.isArray(response) 
                ? [...response].sort((a, b) => b.id - a.id) 
                : [];
            setLoads(sortedData);
        } catch (error) {
            console.error("Yükler alınırken hata:", error);
            addToast("Tamamlanmış yükler listelenemedi", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (load) => {
        setSelectedLoad(load);
        setRatingData({ puan: 5, yorum: "" });
        setIsModalOpen(true);
    };

    const handleSubmitRating = async () => {
        try {
            const driverId = selectedLoad.tasiyiciId;
            
            if (!driverId) {
                addToast("Puanlanacak şoför bilgisi bulunamadı!", "error");
                return;
            }

            const payload = {
                puan: parseInt(ratingData.puan),
                yorum: ratingData.yorum,
                yukId: selectedLoad.id,
                puanlananKullaniciId: driverId,
                puanlayanKullaniciId: selectedLoad.yukSahibi?.id,
            };

            await ratingService.saveRating(payload);
            
            addToast("⭐⭐⭐⭐⭐ Değerlendirmeniz başarıyla kaydedildi!", "success");
            setIsModalOpen(false);
            
            // 🚩 KRİTİK DEĞİŞİKLİK: 
            // Puanlanan yükü mevcut listeden anında çıkartıyoruz.
            setLoads(prevLoads => prevLoads.filter(load => load.id !== selectedLoad.id));
            
        } catch (error) {
            if (error.response?.status === 400) {
                addToast("⚠️ Bu yük için zaten bir değerlendirme yapılmış.", "info");
                // Eğer zaten yapılmışsa yine de listeden çıkaralım ki kafa karışmasın
                setLoads(prevLoads => prevLoads.filter(load => load.id !== selectedLoad.id));
                setIsModalOpen(false);
            } else {
                addToast("Hata: " + (error.response?.data?.message || "İşlem başarısız."), "error");
            }
        }
    };

    if (isLoading) return <div className="loader">Yükleniyor...</div>;

    return (
        <div className="completed-container">
            <div className="sticky-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ⬅ Geri Dön
                </button>
            </div>
            
            <div className="header-section">
                <h2>✅ Tamamlanmış Yüklerim</h2>
                <p className="subtitle">Başarıyla sonuçlanan sevkiyatlarınız burada listelenir.</p>
            </div>

            <div className="loads-grid">
                {loads.length > 0 ? loads.map(load => (
                    <div key={load.id} className="load-card">
                        <div className="card-badge">TAMAMLANDI</div>
                        <h3>Yük #{load.id}</h3>
                        <div className="card-info">
                            <p><strong>📍 Kalkış:</strong> {load.kalkisAdresi?.sehir}</p>
                            <p><strong>🏁 Varış:</strong> {load.varisAdresi?.sehir}</p>
                            <p><strong>🚛 Taşıyıcı:</strong> {load.tasiyiciId || "Belirtilmedi"}</p>
                            <p><strong>🗓️ Tarih:</strong> {load.teslimTarihi ? new Date(load.teslimTarihi).toLocaleDateString('tr-TR') : '-'}</p>
                        </div>
                        <button 
                            className={load.isRated ? "btn-rated" : "rate-btn"} 
                            disabled={load.isRated}
                            onClick={() => handleOpenModal(load)}
                        >
                            {load.isRated ? "✅ Puanlandı" : "⭐ Şoförü Puanla"}
                        </button>
                    </div>
                )) : (
                    <div className="no-data-container">
                        <div className="no-data">Henüz tamamlanmış (veya puanlanmamış) bir yükünüz bulunmamaktadır.</div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedLoad?.tasiyiciAd || "Şoförü"} Değerlendir</h3>
                            <p>#{selectedLoad?.id} nolu yük teslimatı için geri bildiriminiz önemlidir.</p>
                        </div>
                        
                        <div className="modal-body">
                            <div className="rating-input-group">
                                <label>Puanınız</label>
                                <select 
                                    value={ratingData.puan} 
                                    onChange={(e) => setRatingData({...ratingData, puan: e.target.value})}
                                    className="rating-select"
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ (5 - Mükemmel)</option>
                                    <option value="4">⭐⭐⭐⭐ (4 - İyi)</option>
                                    <option value="3">⭐⭐⭐ (3 - Orta)</option>
                                    <option value="2">⭐⭐ (2 - Kötü)</option>
                                    <option value="1">⭐ (1 - Çok Kötü)</option>
                                </select>
                            </div>
                           
                            <div className="rating-input-group">
                                <label>Yorumunuz</label>
                                <textarea 
                                    placeholder="Şoförün hızı ve güvenilirliği nasıldı? (Opsiyonel)"
                                    value={ratingData.yorum}
                                    onChange={(e) => setRatingData({...ratingData, yorum: e.target.value})} 
                                />
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button className="submit-btn" onClick={handleSubmitRating}>Puanı Kaydet</button>
                            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Vazgeç</button>
                        </div>
                    </div>
                </div>
            )}

            <ToastManager toasts={toasts} />
        </div>
    );
}

export default ShipperCompletedLoads;