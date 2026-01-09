import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as loadService from '../../services/loadService';
import * as ratingService from '../../services/ratingService';
import * as offerService from '../../services/offerService';
import './DriverDashboard.css';

function DriverDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth(); 

    const [stats, setStats] = useState({
        availableLoads: 0,
        pendingOffers: 0,
        acceptedLoads: 0,
        totalRevenue: 0,
        grossRevenue: 0,
        points: 0
    });
    
    const [lastComment, setLastComment] = useState(""); 
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDriverStats = async () => {
            if (!user?.id) return;
            
            try {
                setIsLoading(true);

                // Verileri daha güvenli çekiyoruz
                const [loadsRes, offersRes, ratingRes, commentsRes] = await Promise.allSettled([
                    loadService.getAllLoads(),
                    offerService.getDriverOffers(), // Metod ismini kontrol et, genelde budur
                    ratingService.getAverageRating(user.id),
                    ratingService.getDriverRatings(user.id)
                ]);

                // Promise.allSettled sayesinde biri hata alsa bile diğerleri gelir
                const available = loadsRes.status === 'fulfilled' ? (loadsRes.value?.data || loadsRes.value || []) : [];
                const myOffers = offersRes.status === 'fulfilled' ? (offersRes.value?.data || offersRes.value || []) : [];
                const avgRating = ratingRes.status === 'fulfilled' ? (ratingRes.value?.data || ratingRes.value || 0) : 0;
                const comments = commentsRes.status === 'fulfilled' ? (commentsRes.value?.data || commentsRes.value || []) : [];

                const pending = myOffers.filter(o => ['BEKLEMEDE', 'PENDING'].includes(o.durum)).length;
                const accepted = myOffers.filter(o => ['KABUL_EDILDI', 'ACCEPTED', 'YOLDA'].includes(o.durum)).length;
                
                const completedOffers = myOffers.filter(o => ['TAMAMLANDI', 'COMPLETED', 'TESLIM_EDILDI'].includes(o.durum));
                const gross = completedOffers.reduce((sum, o) => sum + (Number(o.teklifFiyati) || 0), 0);
                const net = gross * 0.90;

                
                if (comments.length > 0) {
                    const sortedComments = [...comments].sort((a, b) => (b.id || 0) - (a.id || 0));
                    setLastComment(sortedComments[0].yorum || sortedComments[0].content);
                }

                setStats({
                    availableLoads: available.length,
                    pendingOffers: pending,
                    acceptedLoads: accepted,
                    totalRevenue: net,
                    grossRevenue: gross,
                    points: Number(avgRating) || 0
                });

            } catch (error) {
                console.error("Dashboard Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDriverStats();
    }, [user?.id]);

    if (isLoading) return <div className="dashboard-loading"><div className="spinner"></div><p>Yükleniyor...</p></div>;

    return (
        <div className="driver-dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Merhaba, {user?.ad || 'Sürücü'} 👋</h1>
                    <p className="subtitle">Yük piyasasında bugün {stats.availableLoads} yeni fırsat var.</p>
                </div>
                <div className="driver-badge-container">
                    {stats.points >= 4.5 ? (
                        <span className="badge elite">🏆 Efsane Sürücü</span>
                    ) : (
                        <span className="badge active">🚛 Aktif Sürücü</span>
                    )}
                </div>
            </header>

            <div className="stats-grid">
                {/* KAZANÇ KARTI */}
                <div className="stat-card total-revenue" onClick={() => navigate('/driver/wallet')}>
                    <span className="label">💰 NET KAZANÇ</span>
                    <h2 className="price">{stats.totalRevenue.toLocaleString('tr-TR')} TL</h2>
                    <div className="mini-info">Brüt: {stats.grossRevenue.toLocaleString('tr-TR')} TL</div>
                    <div className="card-link">Cüzdana Git →</div>
                </div>

                {/* PUAN KARTI */}
                <div className="stat-card rating-card" onClick={() => navigate('/driver/my-ratings')}>
                    <span className="label">⭐ PUANIN</span>
                    <h2>{stats.points > 0 ? stats.points.toFixed(1) : "Yeni"}</h2>
                    <div className="feedback-preview">
                        {lastComment ? `"${lastComment.substring(0, 40)}..."` : "Henüz yorum yok"}
                    </div>
                    <div className="card-link">Yorumlar →</div>
                </div>

                {/* AKTİF İŞLER */}
                <div className="stat-card accepted-loads" onClick={() => navigate('/driver/active-loads')}>
                    <span className="label">🚛 AKTİF GÖREVLER</span>
                    <h2>{stats.acceptedLoads}</h2>
                    <p>Takipteki yüklerin</p>
                    <div className="card-link">Haritayı Aç →</div>
                </div>

                {/* YENİ YÜKLER */}
                <div className="stat-card available-loads" onClick={() => navigate('/driver/available-loads')}>
                    <span className="label">📦 YENİ İLANLAR</span>
                    <h2>{stats.availableLoads}</h2>
                    <p>Teklif bekleyen</p>
                    <div className="card-link">Yükleri Gör →</div>
                </div>
            </div>
            
            <section className="quick-actions">
                <h3>Hızlı İşlemler</h3>
                <div className="action-buttons">
                    <button className="action-btn primary" onClick={() => navigate('/driver/available-loads')}>🚚 Yük Ara</button>
                    <button className="action-btn" onClick={() => navigate('/driver/my-offers')}>⏳ Tekliflerim</button>
                    <button className="action-btn" onClick={() => navigate('/driver/completed-loads')}>✅ Geçmişim</button>
                </div>
            </section>
        </div>
    );
}

export default DriverDashboard;