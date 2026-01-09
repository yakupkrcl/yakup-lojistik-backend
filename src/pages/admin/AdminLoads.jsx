import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllLoadsByAdmin } from '../../services/adminService';
import { LoadStatus } from '../../components/enums/loadEnums';
import ToastManager from '../../components/common/ToastManager'; // 🚩 Toast eklendi
import './AdminLoads.css';

const AdminLoads = () => {
    const navigate = useNavigate();
    const [loads, setLoads] = useState([]);
    const [filteredLoads, setFilteredLoads] = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [loading, setLoading] = useState(true); // 🚩 Yükleme durumu

    // --- BİLDİRİM SİSTEMİ (8 SANİYE) ---
    const [toasts, setToasts] = useState([]);
    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(current => current.filter(t => t.id !== id));
        }, 8000);
    };

    useEffect(() => {
        fetchLoads();
    }, []);

    const getDateClass = (teslimTarihi) => {
        const today = new Date();
        const deliveryDate = new Date(teslimTarihi);
        const diffTime = deliveryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'expired';
        if (diffDays <= 3) return 'warning';
        return 'ok';
    };

    useEffect(() => {
        if (statusFilter === 'ALL') {
            setFilteredLoads(loads);
        } else {
            setFilteredLoads(loads.filter(l => l.durum === statusFilter));
        }
    }, [statusFilter, loads]);

    const fetchLoads = async () => {
        setLoading(true);
        try {
            const data = await getAllLoadsByAdmin();
            setLoads(data);
            setFilteredLoads(data);
            // addToast('Yük listesi güncellendi', 'info'); // İsteğe bağlı
        } catch (error) {
            console.error("❌ fetchLoads error:", error);
            addToast('Yükler getirilirken bir hata oluştu!', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-loads-container">
            {/* 🚩 ToastManager eklendi */}
            <ToastManager toasts={toasts} />

            <div className="sticky-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ⬅ Geri Dön
                </button>
            </div>

            <div className="admin-header">
                <h1>Yük Yönetimi</h1>
                <div className="filter-wrapper">
                    <span>Filtrele: </span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Tümü</option>
                        {Object.values(LoadStatus).map((status, index) => (
                            <option key={index} value={status}>
                                {status.replaceAll('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="admin-loads-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Yük Tipi</th>
                            <th>Ağırlık</th>
                            <th>Hacim</th>
                            <th>Durum</th>
                            <th>Teslim Tarihi</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="loading-cell">Veriler yükleniyor...</td></tr>
                        ) : filteredLoads.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty">Kayıt bulunamadı</td>
                            </tr>
                        ) : (
                            filteredLoads.map(load => (
                                <tr key={load.id}>
                                    <td><strong>#{load.id}</strong></td>
                                    <td>{load.yukTipi}</td>
                                    <td>{load.agirlikKg} kg</td>
                                    <td>{load.hacimM3} m³</td>
                                    <td>
                                        <span className={`status-pill ${load.durum?.toLowerCase()}`}>
                                            {load.durum}
                                        </span>
                                    </td>
                                    <td className={getDateClass(load.teslimTarihi)}>
                                        {new Date(load.teslimTarihi).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <Link
                                            to={`/admin/load-details/${load.id}`}
                                            className="detail-btn"
                                        >
                                            Detay
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLoads;