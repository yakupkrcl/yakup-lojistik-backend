import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as loadService from '../../services/loadService';
import * as locationService from '../../services/locationService';
import ApprovalModal from '../../components/common/ApprovalModal';
import ToastManager from '../../components/common/ToastManager';
import './CreateLoad.css';

const CreateLoad = () => {
  const { loadId } = useParams();
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    kalkisAdresiId: '',
    varisAdresiId: '',
    agirlikKg: '',
    hacimM3: '',
    yukTipi: '',
    aciklama: '',
    teslimTarihi: new Date().toISOString().slice(0, 16),
    isFragile: false,
    isStackable: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState(formData.teslimTarihi);

  const [toasts, setToasts] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 🔥 Bildirim süresini 5 saniyeye (5000ms) çıkardım knk
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleDateConfirm = () => {
    setFormData(prev => ({ ...prev, teslimTarihi: tempDate }));
    setIsDateModalOpen(false);
    addToast("Teslim tarihi güncellendi.", "info");
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await locationService.getAllLocations();
        setLocations(data);
      } catch (err) { 
        addToast("Konum verileri yüklenirken bir sorun oluştu.", "error");
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (loadId) {
      setLoading(true);
      loadService.getLoadDetails(loadId)
        .then(res => {
          if (res) {
            setFormData({
              ...res,
              kalkisAdresiId: res.kalkisAdresi?.id || '',
              varisAdresiId: res.varisAdresi?.id || '',
              teslimTarihi: res.teslimTarihi ? new Date(res.teslimTarihi).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
            });
          }
        })
        .catch(() => {
          addToast("Yük bilgileri getirilemedi.", "error");
        })
        .finally(() => setLoading(false));
    }
  }, [loadId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const isFormValid = () => {
    return (
      formData.kalkisAdresiId &&
      formData.varisAdresiId &&
      formData.agirlikKg > 0 &&
      formData.hacimM3 > 0 &&
      formData.yukTipi
    );
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      addToast("Lütfen yıldızlı (*) alanları eksiksiz doldurun!", "info");
      return;
    }
    if (formData.kalkisAdresiId === formData.varisAdresiId) {
        addToast("Kalkış ve varış şehri aynı olamaz!", "error");
        return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleSaveData = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    try {
      if (loadId) {
        await loadService.updateLoad(loadId, formData);
        addToast('Yük başarıyla güncellendi! Listeye yönlendiriliyorsunuz...');
        // Bildirim okunsun diye yönlendirmeyi biraz bekletiyoruz
        setTimeout(() => navigate('/shipper/loads'), 1500);
      } else {
        await loadService.createNewLoad(formData);
        addToast('Tebrikler! Yük ilanınız başarıyla oluşturuldu ve yayınlandı.');
        setTimeout(() => navigate('/shipper/dashboard'), 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'İşlem sırasında bir hata oluştu.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isConfirmModalOpen && !loadId) return <div className="loader">Yükleniyor...</div>;

  return (
    <div className="create-load-container">
      <div className="form-card">
        <div className="sticky-header">
          <button className="back-btn" onClick={() => navigate(-1)}>⬅ Geri Dön</button>
        </div>
        <h2>{loadId ? '📦 Yükü Düzenle' : '🚚 Yeni Yük İlanı'}</h2>
        
        <form onSubmit={handleSubmitClick}>
          <div className="form-grid">
            <div className="form-group">
              <label>Kalkış Noktası*</label>
              <select name="kalkisAdresiId" value={formData.kalkisAdresiId} onChange={handleChange} required>
                <option value="">Seçiniz...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.sehir} - {loc.ilce}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Varış Noktası*</label>
              <select name="varisAdresiId" value={formData.varisAdresiId} onChange={handleChange} required>
                <option value="">Seçiniz...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>📍{loc.sehir} - {loc.ilce}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ağırlık (kg)*</label>
              <input name="agirlikKg" value={formData.agirlikKg} onChange={handleChange} type="number" min="1" required />
            </div>

            <div className="form-group">
              <label>Hacim (m³)*</label>
              <input name="hacimM3" value={formData.hacimM3} onChange={handleChange} type="number" min="0.1" step="0.1" required />
            </div>

            <div className="form-group">
              <label>Yük Tipi*</label>
              <select name="yukTipi" value={formData.yukTipi} onChange={handleChange} required>
                <option value="">Seçiniz...</option>
                <option value="PALETLI">Paletli</option>
                <option value="STANDART">Standart</option>
                <option value="TEHLIKELI_MADDE">Tehlikeli Madde</option>
                <option value="DOKME_YUK">Dökme yük</option>
                <option value="SIVI">Sıvı</option>
              </select>
            </div>

            <div className="form-group">
              <label>Teslim Tarihi*</label>
              <div className="custom-date-picker" onClick={() => setIsDateModalOpen(true)}>
                {new Date(formData.teslimTarihi).toLocaleString('tr-TR')} 📅
              </div>

              {isDateModalOpen && (
                <div className="date-modal-overlay">
                  <div className="date-modal-content">
                    <h3>Tarih ve Saat Seçin</h3>
                    <input 
                      type="datetime-local" 
                      value={tempDate} 
                      onChange={(e) => setTempDate(e.target.value)}
                    />
                    <div className="modal-buttons">
                      <button type="button" onClick={() => setIsDateModalOpen(false)}>İptal</button>
                      <button type="button" className="confirm-btn" onClick={handleDateConfirm}>Kaydet</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-item">
              <input type="checkbox" name="isFragile" checked={formData.isFragile} onChange={handleChange} />
              <span>Kırılabilir</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" name="isStackable" checked={formData.isStackable} onChange={handleChange} />
              <span>İstiflenebilir</span>
            </label>
          </div>

          <div className="form-group full-width">
            <label>Açıklama</label>
            <textarea name="aciklama" value={formData.aciklama} onChange={handleChange} placeholder="Yük hakkında detaylı bilgi yazın..." />
          </div>

          <button type="submit" className={`submit-btn ${!isFormValid() ? 'disabled' : ''}`} disabled={loading}>
            {loading ? 'Yükleniyor...' : (loadId ? 'Güncelle' : 'Yükü Yayınla')}
          </button>
        </form>
      </div>

      <ApprovalModal 
        isOpen={isConfirmModalOpen}
        title={loadId ? "Onaylıyor musunuz?" : "İlan Yayına Alınsın mı?"}
        message={loadId ? "Bilgileri güncellemek istediğinizden emin misiniz?" : "Bu ilan sistemdeki tüm taşıyıcılar tarafından görülecektir."}
        onConfirm={handleSaveData}
        onCancel={() => setIsConfirmModalOpen(false)}
      />

      <ToastManager toasts={toasts} />
    </div>
  );
};

export default CreateLoad;