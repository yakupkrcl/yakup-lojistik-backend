import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as loadService from '../../services/loadService';
import RouteMap from '../../components/common/RouteMap';
import ApprovalModal from '../../components/common/ApprovalModal';
import ToastManager from '../../components/common/ToastManager'; // ✅ Eklendi
import './DriverActiveLoads.css';

function DriverActiveLoads() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null);
  const [deliveryCode, setDeliveryCode] = useState(''); // ✅ Teslimat kodu için
  const [toasts, setToasts] = useState([]); // ✅ Toast yönetimi için
  const [driverPositions, setDriverPositions] = useState({});
  const trackingRefs = useRef({});

  // ✅ Toast Ekleme Fonksiyonu
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchLoads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadService.getDriverLoads();
      const active = (data || []).filter(l => l.durum !== 'TESLIM_EDILDI');
      setLoads(active);
      active.forEach(load => {
        if (load.durum === 'YOLDA') startTracking(load.id);
      });
    } catch (e) {
      addToast("Yükler yüklenirken hata oluştu", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const startTracking = (loadId) => {
    if (trackingRefs.current[loadId]) return;
    trackingRefs.current[loadId] = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const MAX_ACCURACY = process.env.NODE_ENV === 'development' ? 500 : 50;
          if (accuracy && accuracy > MAX_ACCURACY) return;

          setDriverPositions(prev => ({ ...prev, [loadId]: [latitude, longitude] }));
          try {
            await loadService.updateLoadLocation(loadId, latitude, longitude);
          } catch (err) {
            console.error("Konum hatası:", err);
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }, 10000); // 10 saniye idealdir
  };

  useEffect(() => {
    fetchLoads();
    return () => Object.values(trackingRefs.current).forEach(clearInterval);
  }, [fetchLoads]);

  const handleConfirm = async () => {
    if (!action) return;

    try {
      // ✅ TESLİMAT DURUMU: KODLU ONAY
      if (action.status === 'TESLIM_EDILDI') {
        if (!deliveryCode || deliveryCode.length < 6) {
          addToast("Lütfen 6 haneli geçerli kodu girin!", "warning");
          return;
        }
        // Backend'e kodla birlikte gönderiyoruz
        await loadService.confirmDeliveryWithCode(action.id, deliveryCode);
        
        const interval = trackingRefs.current[action.id];
        if (interval) {
          clearInterval(interval);
          delete trackingRefs.current[action.id];
        }
        addToast("Yük başarıyla teslim edildi!", "success");
      } else {
        // YOLA ÇIKTI DURUMU
        await loadService.updateLoadStatus(action.id, action.status);
        if (action.status === 'YOLDA') startTracking(action.id);
        addToast("Yolculuk başladı, iyi sürüşler!", "info");
      }

      setAction(null);
      setDeliveryCode('');
      fetchLoads();
    } catch (err) {
      addToast(err.response?.data?.message || "İşlem başarısız", "error");
    }
  };

  if (loading) return <div className="loader-container"><div className="truck-loader"></div></div>;

  return (
    <div className="active-loads-page">
      <ToastManager toasts={toasts} removeToast={removeToast} />
      
      <header className="page-header">
        <h1>🚛 Aktif Sürüşlerim</h1>
        <p>Yoldaki yüklerinizi yönetin ve anlık takip edin.</p>
      </header>
      

      <div className="active-grid">
        {loads.length === 0 ? (
          <div className="empty-state">Şu an aktif bir sürüşünüz bulunmuyor.</div>
        ) : (
          loads.map(load => (
            <div className="active-card shadow-sm" key={load.id}>
              <div className={`status-tag ${load.durum}`}>
                {load.durum.replaceAll('_', ' ')}
              </div>

              <div className="map-wrapper">
                
                <RouteMap
                
                  currentLocation={
                    load.durum === 'YOLDA' && driverPositions[load.id]
                      ? driverPositions[load.id]
                      : [load.kalkisAdresi?.enlem, load.kalkisAdresi?.boylam]
                  }
                  destination={[load.varisAdresi?.enlem, load.varisAdresi?.boylam]}
                />
              </div>

              <div className="card-body">
                <div className="route-info">
                  <div className="city-info">
                    <span>{load.kalkisAdresi?.sehir}</span>
                    <i className="arrow-icon">→</i>
                    <span>{load.varisAdresi?.sehir}</span>
                  </div>
                  <div className="load-details">
                    <span>📦 {load.yukTipi}</span>
                    <span>⚖️ {load.agirlikKg} kg</span>
                  </div>
                </div>

                <div className="card-footer">
                  {load.durum === 'TEKLIF_KABUL_EDILDI' && (
                    <button className="btn-main start" onClick={() => setAction({ id: load.id, status: 'YOLDA', title: 'Yola Çıkış Onayı' })}>
                      Sürüşü Başlat
                    </button>
                  )}

                  {load.durum === 'YOLDA' && (
                    <button className="btn-main finish" onClick={() => setAction({ id: load.id, status: 'TESLIM_EDILDI', title: 'Teslimatı Onayla' })}>
                      Teslimatı Tamamla
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ApprovalModal
        isOpen={!!action}
        title={action?.title}
        message={action?.status === 'TESLIM_EDILDI' ? "Lütfen yük sahibinden aldığınız onay kodunu girin." : "Sürüşü başlatmak üzeresiniz."}
        onConfirm={handleConfirm}
        onCancel={() => { setAction(null); setDeliveryCode(''); }}
      >
        {action?.status === 'TESLIM_EDILDI' && (
          <div className="code-input-container">
            <input 
              type="text" 
              placeholder="6 Haneli Kod" 
              maxLength="6"
              value={deliveryCode}
              onChange={(e) => setDeliveryCode(e.target.value)}
              className="delivery-code-input"
            />
          </div>
        )}
      </ApprovalModal>
    </div>
  );
}

export default DriverActiveLoads;