import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as offerService from '../../services/offerService';
import './DriverMyOffers.css';

function DriverMyOffers() {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('HEPSI');

    const fetchMyOffers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await offerService.getDriverOffers();
            // En yeni teklifi en üstte göstermek için ID'ye göre ters sıralıyoruz
            const sortedData = (data ?? []).sort((a, b) => b.id - a.id);
            setOffers(sortedData);
        } catch (err) {
            setError(err.response?.data?.message || 'Teklif geçmişiniz yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyOffers();
    }, [fetchMyOffers]);

    // =========================
    // TÜM DURUMLAR İÇİN CSS (ENUM UYUMLU)
    // =========================
    const getStatusClass = (status) => {
        switch (status) {
            case 'KABUL_EDILDI': return 'status-accepted';
            case 'YOLDA': return 'status-on-way';
            case 'REDDEDILDI': return 'status-rejected';
            case 'TAMAMLANDI':
            case 'TESLIM_EDILDI': return 'status-completed';
            case 'BEKLEMEDE':
            default: return 'status-pending';
        }
    };

    const getStatusLabel = (status) => {
        return status.replace('_', ' ');
    };

    // Filtreleme Mantığı
    const filteredOffers = useMemo(() => {
        if (filterStatus === 'HEPSI') return offers;
        return offers.filter(o => o.durum === filterStatus);
    }, [offers, filterStatus]);

    if (isLoading) return <div className="driver-offers-loading">Teklifler yükleniyor...</div>;
    if (error) return <div className="driver-offers-error">Hata: {error}</div>;

    return (
        <div className="driver-offers-container">
  <div className="sticky-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ⬅ Geri Dön
            </button>
            </div>
            <h2>📜 Teklif Geçmişim ({offers.length})</h2>

            {/* Hızlı Filtreleme Butonları */}
            <div className="status-filter-bar">
                {['HEPSI', 'TAMAMLANDI', 'BEKLEMEDE', 'KABUL_EDILDI', 'YOLDA', 'REDDEDILDI'].map(status => (
                    <button 
                        key={status}
                        className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                        onClick={() => setFilterStatus(status)}
                    >
                        {status === 'TAMAMLANDI' ? 'TAMAMLANAN' : status}
                    </button>
                ))}
            </div>

            {filteredOffers.length === 0 ? (
                <div className="no-offers-message">Bu kategoride teklifiniz bulunmamaktadır.</div>
            ) : (
                <div className="offers-list">
                    {filteredOffers.map((offer) => {
                        const yuk = offer.yuk;
                        const isCompleted = offer.durum === 'TAMAMLANDI' || offer.durum === 'TESLIM_EDILDI';

                        return (
                            <div key={offer.id} className={`offer-card ${getStatusClass(offer.durum)}`}>
                                <div className="card-header">
                                    <h4>
                                        📍 {yuk?.kalkisAdresi?.sehir || 'Bilinmiyor'} ➡️ {yuk?.varisAdresi?.sehir || 'Bilinmiyor'}
                                    </h4>
                                    <span className={`offer-status-badge ${getStatusClass(offer.durum)}`}>
                                        {getStatusLabel(offer.durum)}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <div className="offer-info-grid">
                                        <p><strong>💰 Fiyat:</strong> {offer.teklifFiyati?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                                        <p><strong>📦 Görev No:</strong> #{yuk?.id || '---'}</p>
                                        <p><strong>📅 Teslim:</strong> {yuk?.teslimTarihi ? new Date(yuk.teslimTarihi).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</p>
                                        <p><strong>🚛 Yük Tipi:</strong> {yuk?.yukTipi || 'Genel Kargo'}</p>
                                    </div>
                                </div>

                                {/* Dinamik Aksiyon Butonları */}
                                <div className="card-footer">
                                    {offer.durum === 'KABUL_EDILDI' && (
                                        <button className="action-btn go-active" onClick={() => navigate('/driver/active-loads')}>
                                            🚚 Göreve Başla / Detaylar
                                        </button>
                                    )}
                                    {offer.durum === 'YOLDA' && (
                                        <button className="action-btn go-active" onClick={() => navigate('/driver/active-loads')}>
                                            📍 Mevcut Konumu Güncelle
                                        </button>
                                    )}
                                    {isCompleted && (
                                        <span className="completed-text">✅ Bu görev başarıyla tamamlandı.</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DriverMyOffers;