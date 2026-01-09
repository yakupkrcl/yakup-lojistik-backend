import React, { useEffect, useState, useCallback } from 'react';
import * as offerService from '../../services/offerService';
import './DriverCompletedLoads.css';
import { useNavigate } from 'react-router-dom';

function DriverCompletedLoads() {
    const [completedOffers, setCompletedOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate=useNavigate();

    // --- FİLTRELEME VE SIRALAMA STATE'LERİ ---
    const [dateFilter, setDateFilter] = useState("all"); // Tarih aralığı
    const [sortBy, setSortBy] = useState("date_desc");    // Sıralama

    const fetchCompletedTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const offers = await offerService.getDriverOffers();
            const completed = (offers ?? []).filter(
                (offer) => offer.durum === 'TESLIM_EDILDI' || offer.durum === 'TAMAMLANDI'
            );
            setCompletedOffers(completed);
        } catch (err) {
            setError(err.response?.data?.message || 'Veriler yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompletedTasks();
    }, [fetchCompletedTasks]);

    // --- TARİH VE SIRALAMA MANTIĞI ---
    const processedOffers = completedOffers
        .filter(offer => {
            if (dateFilter === "all") return true;

            // Not: Eğer backend'de özel bir 'tamamlanmaTarihi' yoksa 
            // şimdilik 'yuk.olusturulmaTarihi' üzerinden işlem yapar.
            const dateStr = offer.yuk?.olusturulmaTarihi || offer.olusturulmaTarihi;
            if (!dateStr) return true;

            const loadDate = new Date(dateStr);
            const now = new Date();
            
            // Bugünün başlangıcı (Saat 00:00:00)
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            // Hafta ve Ay hesaplama (milisaniye üzerinden)
            const oneDay = 24 * 60 * 60 * 1000;
            const weekStart = new Date(now.getTime() - 7 * oneDay);
            const monthStart = new Date(now.getTime() - 30 * oneDay);

            if (dateFilter === "today") return loadDate >= todayStart;
            if (dateFilter === "week") return loadDate >= weekStart;
            if (dateFilter === "month") return loadDate >= monthStart;

            return true;
        })
        .sort((a, b) => {
            if (sortBy === "price_asc") return a.teklifFiyati - b.teklifFiyati;
            if (sortBy === "price_desc") return b.teklifFiyati - a.teklifFiyati;
            // ID'ye göre sıralama (Yeni olanın ID'si genelde büyüktür)
            return sortBy === "date_desc" ? (b.id - a.id) : (a.id - b.id);
        });

    const formatAdres = (adres) => {
        if (!adres) return 'Adres Bilgisi Yok';
        return `${adres.sehir || ''} ${adres.ilce || ''}`.trim() || 'Adres Detayı Eksik';
    };

    if (isLoading) return <div className="completed-loading">Yükleniyor...</div>;
    if (error) return <div className="completed-error">Hata: {error}</div>;

    return (
        <div className="completed-container">
              <div className="sticky-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ⬅ Geri Dön
            </button>
            </div>
            <div className="header-section">
                
                <h2>✅ Tamamlanan Görevlerim</h2>
                
                {/* --- KONTROL PANELİ --- */}
<div className="filter-bar">
            <div className="filter-group">
                <label>Zaman Aralığı:</label>
                <select className="filter-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                    <option value="all">Tüm Zamanlar</option>
                    <option value="today">Bugün</option>
                    <option value="week">Son 7 Gün</option>
                    <option value="month">Son 30 Gün</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Sıralama:</label>
                <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="date_desc">En Yeni</option>
                    <option value="price_desc">En Yüksek Fiyat</option>
                    <option value="price_asc">En Düşük Fiyat</option>
                </select>
            </div>
        </div>
    </div>

            <div className="completed-grid">
                {processedOffers.map((offer) => {
                    const yuk = offer.yuk;
                    return (
                        <div key={offer.id} className="completed-card">
                            <div className="completed-route">
                                📍 {formatAdres(yuk?.kalkisAdresi)} ➡️ 📍 {formatAdres(yuk?.varisAdresi)}
                            </div>
                            <div className="completed-details">
                                <p><strong>📦 Görev No:</strong> #{yuk?.id}</p>
                                <p><strong>🚛 Yük Tipi:</strong> {yuk?.yukTipi || 'Genel Kargo'}</p>
                                <p>
                                    <strong>💰 Kazanılan:</strong>{' '}
                                    {offer.teklifFiyati?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                </p>
                            </div>
                            <div className="completed-footer">
                                <span className="status-badge">🟢 TAMAMLANDI</span>
                                {/* Buraya ileride 'Puan Ver' butonu gelecek knk */}
                            </div>
                        </div>
                    );
                })}
            </div>

            {processedOffers.length === 0 && (
                <div className="no-results">Seçilen zaman aralığında tamamlanmış görev bulunamadı.</div>
            )}
        </div>
    );
}

export default DriverCompletedLoads;