import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as loadService from '../../services/loadService';
import RouteMap from '../../components/common/RouteMap';
import ApprovalModal from '../../components/common/ApprovalModal';
import ToastManager from '../../components/common/ToastManager';
import './DriverActiveLoads.css';

function DriverActiveLoads() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null);
  const [deliveryCode, setDeliveryCode] = useState('');
  const [toasts, setToasts] = useState([]);
  const [driverPositions, setDriverPositions] = useState({});
  const trackingRefs = useRef({});

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

const startTracking = (loadId) => {
    if (trackingRefs.current[loadId]) return;

    console.log("🛰️ GPS Takibi Başlatılıyor...");

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        
        // 1000 metreden kötüyse işleme alma (Log basmıyoruz ki kalabalık etmesin)
        if (accuracy && accuracy > 1000) return;

        // State güncelleme (Buradaki yazım hatasını düzelttim)
        setDriverPositions(prev => ({ ...prev, [loadId]: [latitude, longitude] }));

        try {
          // Backend'e gönder
          await loadService.updateLoadLocation(loadId, latitude, longitude);
          console.log(`📍 Konum Güncellendi: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch (err) {
          console.error("❌ DB Güncelleme Hatası:", err);
        }
      },
      (err) => {
        console.error("🚨 Geolocation Hatası:", err.code, err.message);
        if (err.code === 1) addToast("Konum izni reddedildi!", "error");
        else if (err.code === 3) addToast("GPS zaman aşımı.", "warning");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    trackingRefs.current[loadId] = watchId;
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

  useEffect(() => {
    fetchLoads();
    return () => {
      // ✅ Bileşen kapanırken tüm takipleri durdur
      Object.values(trackingRefs.current).forEach(id => navigator.geolocation.clearWatch(id));
    };
  }, [fetchLoads]);

  const handleConfirm = async () => {
    if (!action) return;

    try {
      if (action.status === 'TESLIM_EDILDI') {
        if (!deliveryCode || deliveryCode.length < 6) {
          addToast("Lütfen 6 haneli kodu girin!", "warning");
          return;
        }
        await loadService.confirmDeliveryWithCode(action.id, deliveryCode);
        
        // ✅ HATA BURADAYDI: clearInterval değil clearWatch kullanıyoruz
        if (trackingRefs.current[action.id]) {
          navigator.geolocation.clearWatch(trackingRefs.current[action.id]);
          delete trackingRefs.current[action.id];
        }
        addToast("Yük başarıyla teslim edildi!", "success");
      } else {
        await loadService.updateLoadStatus(action.id, action.status);
        if (action.status === 'YOLDA') startTracking(action.id);
        addToast("Yolculuk başladı!", "info");
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
      </header>
      <div className="active-grid">
        {loads.length === 0 ? (
          <div className="empty-state">Aktif sürüş bulunmuyor.</div>
        ) : (
          loads.map(load => (
            <div className="active-card shadow-sm" key={load.id}>
              <div className={`status-tag ${load.durum}`}>{load.durum}</div>
              <div className="map-wrapper">
                <RouteMap
                  currentLocation={
                    load.durum === 'YOLDA' && driverPositions[load.id]
                      ? driverPositions[load.id]
                      : [load.kalkisAdresi?.enlem || 39, load.kalkisAdresi?.boylam || 35]
                  }
                  destination={[load.varisAdresi?.enlem, load.varisAdresi?.boylam]}
                />
              </div>
              {/* Diğer kart içerikleri aynı kalabilir */}
              <div className="card-footer">
                {load.durum === 'TEKLIF_KABUL_EDILDI' && (
                  <button className="btn-main start" onClick={() => setAction({ id: load.id, status: 'YOLDA', title: 'Yola Çıkış' })}>Başlat</button>
                )}
                {load.durum === 'YOLDA' && (
                  <button className="btn-main finish" onClick={() => setAction({ id: load.id, status: 'TESLIM_EDILDI', title: 'Teslim Et' })}>Tamamla</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <ApprovalModal isOpen={!!action} title={action?.title} onConfirm={handleConfirm} onCancel={() => setAction(null)}>
         {action?.status === 'TESLIM_EDILDI' && (
           <input type="text" maxLength="6" value={deliveryCode} onChange={(e) => setDeliveryCode(e.target.value)} />
         )}
      </ApprovalModal>
    </div>
  );
}

export default DriverActiveLoads;