import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as loadService from '../../services/loadService';
import { useAuth } from '../../context/AuthContext';
import ToastManager from '../../components/common/ToastManager';
import './ShipperLoads.css';

const ShipperLoads = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loads, setLoads] = useState([]);
  const [filteredLoads, setFilteredLoads] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); 
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    const fetchLoads = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadService.getShipperLoads();
      const sortedData = Array.isArray(data) 
          ? [...data].sort((a, b) => b.id - a.id) 
          : [];
        setLoads(sortedData);
        setFilteredLoads(sortedData); 
      } catch (err) {
        setError("Yükler yüklenirken hata oluştu.");
        addToast("Veriler alınamadı!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLoads();
  }, [user]); // user nesnesine göre takibi güncelledik

  useEffect(() => {
    if (filter === 'ALL') {
      setFilteredLoads(loads);
    } else {
      const filtered = loads.filter(load => load.durum === filter);
      setFilteredLoads(filtered);
    }
  }, [filter, loads]);

  const handleEditLoad = (load) => {
    // Backend'den teklifSayisi geliyorsa onu kullanıyoruz, yoksa array length
    const offerCount = load.teklifSayisi ?? load.teklifler?.length ?? 0;
    
    if (offerCount > 0) {
      addToast('Bu yük teklif aldığı için düzenlenemez!', 'info');
      return;
    }
    navigate(`/shipper/loads/form/${load.id}`);
  };

  const getStatusText = (status) => {
    const labels = {
      'YAYINDA': 'İlanda',
      'TEKLIF_ALDI': 'Teklif Geldi',
      'TEKLIF_KABUL_EDILDI': 'Onaylandı',
      'YOLDA': 'Yolda',
      'TESLIM_EDILDI': 'Teslim Edildi'
    };
    return labels[status] || status;
  };

  if (loading) return <div className="shipper-loading">Yükler yükleniyor...</div>;
  if (error) return <div className="shipper-error">{error}</div>;

  return (
    <div className="shipper-loads-container">
      <div className="header-section">
        <div className="sticky-header">
          <button className="back-btn" onClick={() => navigate('/shipper/dashboard')}>
            ⬅ Geri Dön
          </button>
        </div>
        <h2>📝 Yüklerim ve Takip</h2>
        
        <div className="header-actions">
          <select 
            className="status-dropdown"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="YAYINDA">Yayında</option>
            <option value="TEKLIF_ALDI">Teklif Aldı</option>
            <option value="TEKLIF_KABUL_EDILDI">Onaylandı</option>
            <option value="YOLDA">Yolda</option>
            <option value="TESLIM_EDILDI">Teslim Edildi</option>
          </select>

          <button className="new-load-button" onClick={() => navigate('/shipper/loads/new')}>
            + Yeni Yük Oluştur
          </button>
        </div>
      </div>

      {filteredLoads.length === 0 ? (
        <div className="no-data-wrapper">
            <p className="no-data">Seçilen kriterde yük bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="load-cards">
          {filteredLoads.map(load => {
            const offerCount = load.teklifSayisi ?? load.teklifler?.length ?? 0;
            const duzenlemeKapali = offerCount > 0;
            const isTrackingAvailable = ['YOLDA', 'YUKLENIYOR'].includes(load.durum);

            return (
              <div key={load.id} className={`load-card ${load.durum}`}>
                <div className={`load-status-badge ${load.durum?.toLowerCase()}`}>
                    {getStatusText(load.durum)}
                </div>
                
                <h3 className="route-title">
                  {load.kalkisAdresi?.sehir || '-'} ➡️ {load.varisAdresi?.sehir || '-'}
                </h3>

               <div className="load-details">
  <p><span>⚖️ Ağırlık:</span> {load.agirlikKg} kg</p>
  <p><span>📦 Hacim:</span> {load.hacimM3} m³</p>
  <p><span>💬 Teklifler:</span> <strong>{offerCount}</strong></p>

  {/* 🚩 TESLİMAT KODU BURAYA GELECEK */}
  {load.deliveryCode && (
    <div className="delivery-code-badge-mini">
      <span>🔑 Onay Kodu:</span>
      <strong className="code-text">{load.deliveryCode}</strong>
    </div>
  )}
</div>

                <div className="card-actions">
                  <button className="btn-offers" onClick={() => navigate(`/shipper/manage-offers/${load.id}`)}>
                    Teklifleri Gör
                  </button>

                  {isTrackingAvailable && (
                    <button 
                      className="btn-track pulse" 
                      onClick={() => navigate(`/shipper/tracking/${load.id}`)}
                    >
                      📍 Takip Et
                    </button>
                  )}

                  <button
                    onClick={() => handleEditLoad(load)}
                    className={`btn-edit ${duzenlemeKapali ? 'disabled' : ''}`}
                    title={duzenlemeKapali ? "Teklif varken düzenlenemez" : ""}
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ToastManager toasts={toasts} />
    </div>
  );
};

export default ShipperLoads;