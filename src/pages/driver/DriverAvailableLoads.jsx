import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as loadService from '../../services/loadService';
import './DriverAvailableLoads.css';

function DriverAvailableLoads() {
    const navigate = useNavigate();
    const [availableLoads, setAvailableLoads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('newest');

    const fetchAvailableLoads = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await loadService.getAllLoads();
            setAvailableLoads(data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Yükler yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchAvailableLoads(); }, [fetchAvailableLoads]);

    const processedLoads = useMemo(() => {
        let filtered = [...availableLoads];
        if (sortBy === 'newest') filtered.sort((a, b) => b.id - a.id);
        else if (sortBy === 'oldest') filtered.sort((a, b) => a.id - b.id);
        return filtered;
    }, [availableLoads, sortBy]);

    if (isLoading) return <div className="loads-loading">Yükleniyor...</div>;

    return (
        <div className="available-loads-container">
            <div className="sticky-header">
                <button className="back-btn" onClick={() => navigate(-1)}>⬅ Geri Dön</button>
            </div>
            <h2>🔎 Teklif Verilebilecek Yük Pazarı</h2>

            <div className="filter-bar">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                    <option value="newest">En Yeni İlanlar</option>
                    <option value="oldest">Eskiden Yeniye</option>
                </select>
                <div className="total-info">Toplam {processedLoads.length} aktif ilan</div>
            </div>

            <div className="load-cards-list">
                {processedLoads.map((load) => (
                    <div key={load.id} className="available-load-card">
                    <div className="card-main-content">
        <div className="card-header" style={{ position: 'relative' }}> {/* Güvenlik için relative */}
            <h3>
                {load.kalkisAdresi?.sehir || "Belirtilmedi"} 
                <span> ➡️ </span> 
                {load.varisAdresi?.sehir || "Belirtilmedi"}
            </h3>
            {/* Badge artık kartın header'ına bağlı kalacak, yukarı fırlamayacak */}
            <span className="load-status-badge">YAYINDA</span>
        </div>
                            
                            <div className="card-body">
                                <p><strong>📍 İlçe:</strong> {load.kalkisAdresi?.ilce || "-"} / {load.varisAdresi?.ilce || "-"}</p>
                                <p><strong>📦 Ağırlık:</strong> {load.agirlikKg} kg</p>
                                <p><strong>📅 Teslim:</strong> {load.teslimTarihi ? new Date(load.teslimTarihi).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</p>
                            </div>
                        </div>

                        <div className="card-footer">
                            <div className="footer-left">
                                <span className="offer-count">📩 {load.teklifSayisi || 0} Teklif</span>
                            </div>
                            <button 
                                className="make-offer-button"
                                onClick={() => navigate(`/driver/loads/${load.id}/make-offer`)}
                            >
                                Teklif Ver
                            </button> 
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DriverAvailableLoads;