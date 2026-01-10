import React, { useState, useEffect, useCallback } from 'react';
import {  useNavigate } from 'react-router-dom';
import * as loadService from '../../services/loadService';
import './DriverLoads.css'; // Stil dosyasını dahil et

// Varsayılan yük durumları
const LOAD_STATUSES = {
    ATANMIS: "Atanmış (Yola Çıkış Bekleniyor)",
    YOLDA: "Yolda",
    TESLIM_EDILDI: "Teslim Edildi",
    IPTAL_EDILDI: "İptal Edildi"
};

function DriverLoads() {
    const [myLoads, setMyLoads] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();
    
    // ===========================================
    // Taşıyıcının Kabul Edilen Yüklerini (Görevlerini) Çekme
    // ===========================================
    const fetchDriverLoads = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // MERKEZİ API ÇAĞRISI: loadService.getDriverLoads kullanılıyor
            const data = await loadService.getDriverLoads(); 
            setMyLoads(data);

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Görevleriniz yüklenirken bir sorun oluştu.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDriverLoads();
    }, [fetchDriverLoads]); 
    
    // ===========================================
    // Yük Durumunu Güncelleme İşlemi
    // ===========================================
    const handleUpdateLoadStatus = async (loadId, newStatus) => {
        if (isUpdating) return;

        if (!window.confirm(`Yük ID ${loadId}'nin durumunu "${LOAD_STATUSES[newStatus]}" olarak güncellemek istediğinizden emin misiniz?`)) {
            return;
        }

        setIsUpdating(true);
        setError(null);

        try {
            // loadService.updateLoadStatus servisini kullanıyoruz (bu servisin var olduğunu varsayıyoruz)
            await loadService.updateLoadStatus(loadId, newStatus); 
            
            // Başarılı olursa listeyi yenile
            alert(`Durum başarıyla ${LOAD_STATUSES[newStatus]} olarak güncellendi!`);
            fetchDriverLoads();

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Durum güncelleme başarısız oldu.";
            setError(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };


    // ===========================================
    // EKRAN GÖRÜNÜMÜ
    // ===========================================

    if (isLoading) {
        return <div className="driver-loads-loading">Görev listeniz yükleniyor...</div>;
    }

    if (error) {
        return <div className="driver-loads-error">Hata: {error}</div>;
    }
    
    return (
        <div className="driver-loads-container">
 <div className="sticky-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ⬅ Geri Dön
            </button>
            </div>
            <h2>🚚 Kabul Edilen Görevlerim (Yük Takibi)</h2>
            <p>Toplam Aktif Görev Sayısı: <strong>{myLoads.filter(l => l.status !== 'TESLIM_EDILDI' && l.status !== 'IPTAL_EDILDI').length}</strong></p>
            
            <div className="load-list-table">
                {myLoads.map((load) => (
                    <div key={load.id} className={`load-item status-${load.status.toLowerCase()}`}>
                        
                        <div className="load-details">
                            <h3 className="load-route">{load.kalkisAdresi?.city} ➡️ {load.varisAdresi?.city}</h3>
                            <p><strong>Yük ID:</strong> {load.id}</p>
                            <p><strong>Ağırlık:</strong> {load.agirlikKg} kg</p>
                            <p><strong>Teslim Tarihi:</strong> {new Date(load.teslimTarihi).toLocaleDateString()}</p>
                        </div>

                        <div className="load-status-section">
                            <span className={`status-badge`}>
                                {LOAD_STATUSES[load.status] || load.status}
                            </span>
                            
                            {/* Durum Güncelleme Butonları */}
                            <div className="status-actions">
                                {/* ATANMIS -> YOLDA */}
                                {load.status === 'ATANMIS' && (
                                    <button 
                                        onClick={() => handleUpdateLoadStatus(load.id, 'YOLDA')}
                                        disabled={isUpdating}
                                        className="action-button primary"
                                    >
                                        Yola Çıktım
                                    </button>
                                )}
                                {/* YOLDA -> TESLIM_EDILDI */}
                                {load.status === 'YOLDA' && (
                                    <button 
                                        onClick={() => handleUpdateLoadStatus(load.id, 'TESLIM_EDILDI')}
                                        disabled={isUpdating}
                                        className="action-button success"
                                    >
                                        Teslim Ettim
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
        </div>
    );
}

export default DriverLoads;