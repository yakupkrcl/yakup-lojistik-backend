import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as loadService from '../../services/loadService';
import * as offerService from '../../services/offerService';
import * as transactionService from '../../services/transactionService';
import './ShipperDashboard.css';

const ShipperDashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        activeLoads: 0,
        pendingOffers: 0,
        acceptedLoads: 0,
        totalSpent: 0
    });

    const [recentLoads, setRecentLoads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Verileri Çek
                const [loads, transactions] = await Promise.all([
                    loadService.getShipperLoads(),
                    transactionService.getShipperTransactions()
                ]);

                const sortedLoads = Array.isArray(loads) 
                    ? [...loads].sort((a, b) => b.id - a.id) 
                    : [];

                // 🔍 Teklif sayısını hesapla: Her yük için teklifleri ayrı ayrı çekmek yerine
                // Mevcut yüklerin durumlarını kontrol ederek istatistik çıkarıyoruz.
                let totalOffersCount = 0;
                let completedCount = 0;

                sortedLoads.forEach(load => {
                    // Eğer yük durumu 'TEKLIF_ALDI' ise en az bir teklif vardır
                    if (load.durum === 'TEKLIF_ALDI') totalOffersCount++;
                    // Tamamlanan veya yolda olan yükler 'KABUL_EDILDI' kapsamındadır
                    if (['TEKLIF_KABUL_EDILDI', 'YOLDA', 'TESLIM_EDILDI'].includes(load.durum)) {
                        completedCount++;
                    }
                });

                const totalSpentValue = (transactions || []).reduce((sum, t) => sum + (Number(t.miktar || 0)), 0);

                setStats({
                    activeLoads: sortedLoads.length,
                    pendingOffers: totalOffersCount, // İlan bazlı teklif durumu
                    acceptedLoads: completedCount,
                    totalSpent: totalSpentValue
                });

                setRecentLoads(sortedLoads.slice(0, 5));

            } catch (err) {
                console.error('Dashboard güncelleme hatası:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Backend Enum değerlerini kullanıcı dostu metinlere ve CSS sınıflarına çevirir
    const getStatusLabel = (status) => {
        const map = {
            'YAYINDA': { text: 'İlanda', class: 'yayinda' },
            'TEKLIF_ALDI': { text: 'Teklif Geldi', class: 'teklif-aldi' },
            'TEKLIF_KABUL_EDILDI': { text: 'Onaylandı', class: 'onaylandi' },
            'YOLDA': { text: 'Yolda', class: 'yolda' },
            'TESLIM_EDILDI': { text: 'Teslim Edildi', class: 'teslim-edildi' },
            'IPTAL_EDILDI': { text: 'İptal', class: 'iptal' }
        };
        return map[status] || { text: status, class: 'default' };
    };

    if (loading) {
        return (
            <div className="shipper-loading-container">
                <div className="shipper-spinner"></div>
                <p>Panel verileri senkronize ediliyor...</p>
            </div>
        );
    }

    return (
        <div className="shipper-dashboard">
            <div className="shipper-header">
                <div className="header-content">
                    <h1>Yük Sahibi Paneli 🚛</h1>
                    <p>Lojistik operasyonlarınızı ve ödemelerinizi buradan yönetin.</p>
                </div>
                <div className="header-badge">Kurumsal Hesap</div>
            </div>

            <div className="shipper-stats">
                <StatCard title="Toplam Yük" value={stats.activeLoads} color="blue" icon="📦" />
                <StatCard title="Aktif İlanlar" value={stats.pendingOffers} color="orange" icon="📨" />
                <StatCard title="Tamamlanan Sevkiyat" value={stats.acceptedLoads} color="green" icon="✅" />
                
                <div onClick={() => navigate('/shipper/wallet')} className="stat-card-clickable">
                    <StatCard
                        title="Toplam Harcama"
                        value={stats.totalSpent.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                        })}
                        color="purple"
                        icon="💳"
                    />
                    <span className="click-hint">Cüzdana Git →</span>
                </div>
            </div>

            <div className="shipper-actions-grid">
                <button className="action-btn primary" onClick={() => navigate('/shipper/loads/new')}>
                    <span className="btn-icon">➕</span> Yeni Yük Oluştur
                </button>
                <button className="action-btn secondary" onClick={() => navigate('/shipper/loads')}>
                    <span className="btn-icon">📋</span> Yüklerimi Yönet
                </button>
                <button className="action-btn wallet" onClick={() => navigate('/shipper/wallet')}>
                    <span className="btn-icon">💰</span> Finansal Özet
                </button>
            </div>

            <div className="recent-section">
                <div className="section-header">
                    <h2>📦 Son Yük İlanları</h2>
                    <button className="all-view-btn" onClick={() => navigate('/shipper/loads')}>Tümünü Gör</button>
                </div>

                {recentLoads.length === 0 ? (
                    <div className="no-data-placeholder">
                        <p>Henüz bir yük ilanınız bulunmuyor.</p>
                        <button onClick={() => navigate('/shipper/loads/new')}>Hemen İlk İlanı Oluştur</button>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Yük Tipi</th>
                                    <th>Ağırlık</th>
                                    <th>Durum</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLoads.map(load => {
                                    const statusObj = getStatusLabel(load.durum);
                                    return (
                                        <tr key={load.id}>
                                            <td><strong>#{load.id}</strong></td>
                                            <td className="type-cell">{load.yukTipi}</td>
                                            <td>{load.agirlikKg || 0} kg</td>
                                            <td>
                                                <span className={`status-pill ${statusObj.class}`}>
                                                    {statusObj.text}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="detail-btn" 
                                                    onClick={() => navigate(`/shipper/manage-offers/${load.id}`)} 
                                                >
                                                    Teklifler
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, icon }) => (
    <div className={`stat-card ${color}`}>
        <div className="card-icon">{icon}</div>
        <div className="card-info">
            <h2>{value}</h2>
            <p>{title}</p>
        </div>
    </div>
);

export default ShipperDashboard;