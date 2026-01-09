import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as loadService from '../../services/loadService';
import * as offerService from '../../services/offerService';
import * as userService from '../../services/userService';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        netProfit: 0,
        activeLoads: 0,
        pendingLoads: 0,
        userCount: 0
    });

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                console.log("Admin verileri çekiliyor...");
                
                // Servis dosyasındaki yeni isimlendirmelere göre güncellendi
                const [loads, users, allOffers] = await Promise.all([
                    loadService.getAllLoadsByAdmin(), // getAllLoads -> getAllLoadsByAdmin yapıldı
                    userService.getAllUsers(),
                    offerService.getAllOffersAdmin()
                ]);

                // Verilerin dizi olduğundan emin olalım (null/undefined kontrolü)
                const safeLoads = Array.isArray(loads) ? loads : [];
                const safeUsers = Array.isArray(users) ? users : [];
                const safeOffers = Array.isArray(allOffers) ? allOffers : [];

                // Finansal hesaplama (Case-insensitive kontrol)
                const completed = safeOffers.filter(o => {
                    const status = (o.durum || "").toUpperCase();
                    return status === 'TAMAMLANDI' || status === 'COMPLETED';
                });

                const gross = completed.reduce((sum, o) => sum + (Number(o.teklifFiyati) || 0), 0);
                
                // Bekleyen yüklerin sayısını hesapla
                const pending = safeLoads.filter(l => (l.durum || "").toUpperCase() === 'BEKLEMEDE').length;

                setStats({
                    totalRevenue: gross,
                    netProfit: gross * 0.10,
                    activeLoads: safeLoads.length,
                    pendingLoads: pending,
                    userCount: safeUsers.length
                });

                setError(null);
            } catch (err) {
                console.error("Dashboard hatası:", err);
                if (err.response?.status === 401) {
                    setError("Oturum süresi dolmuş veya yetkisiz erişim. Lütfen tekrar giriş yapın.");
                } else {
                    setError("Veriler yüklenirken bir sorun oluştu.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminStats();
    }, []);

    if (isLoading) return (
        <div className="admin-loader-container">
            <div className="admin-spinner"></div>
            <p>Sistem Verileri Senkronize Ediliyor...</p>
        </div>
    );

    if (error) return (
        <div className="admin-error">
            {error} <button onClick={() => window.location.reload()}>Tekrar Dene</button>
        </div>
    );

    return (
        <div className="admin-dashboard-container">
            <header className="admin-header">
                <div className="header-info">
                    <h1>Yönetim Paneli 💎</h1>
                    <p>Sistem genelindeki <strong>{stats.activeLoads}</strong> aktif yük ve finansal durum.</p>
                </div>
                <div className="admin-status-badge">Sistem Çevrimiçi</div>
            </header>

            <section className="admin-stats-grid">
                <div className="admin-stat-card main-profit" onClick={() => navigate('/admin/wallet')}>
                    <span className="label">💰 SİSTEM NET KÂRI (%10)</span>
                    <h2>{stats.netProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</h2>
                    <p>Ciro: {stats.totalRevenue.toLocaleString('tr-TR')} TL</p>
                    <div className="card-footer-text">Finans Merkezi →</div>
                </div>

                <div className="admin-stat-card active-traffic" onClick={() => navigate('/admin/admin-loads')}>
                    <span className="label">🚛 YÜK TRAFİĞİ</span>
                    <h2>{stats.activeLoads} Toplam Yük</h2>
                    <p>{stats.pendingLoads} onay bekliyor</p>
                    <div className="card-footer-text">Yükleri Yönet →</div>
                </div>

                <div className="admin-stat-card user-power" onClick={() => navigate('/admin/admin-users')}>
                    <span className="label">👥 KULLANICI GÜCÜ</span>
                    <h2>{stats.userCount} Üye</h2>
                    <p>Şoför ve Müşteri Kaydı</p>
                    <div className="card-footer-text">Üyeleri Gör →</div>
                </div>
            </section>

            <section className="quick-nav-section">
                <h3>Hızlı Operasyon Paneli</h3>
                <div className="quick-nav-grid">
                    <button onClick={() => navigate('/admin/admin-loads')} className="nav-item">📦 Yük Yönetimi</button>
                    <button onClick={() => navigate('/admin/admin-users')} className="nav-item">👥 Üye Yönetimi</button>
                    <button onClick={() => navigate('/admin/admin-transactions')} className="nav-item highlight">💳 Finans Kayıtları</button>
                    <button onClick={() => navigate('/admin/documents')} className="nav-item">📄 Evrak Onayı</button>
                </div>
            </section>
        </div>
    );
}

export default AdminDashboard;