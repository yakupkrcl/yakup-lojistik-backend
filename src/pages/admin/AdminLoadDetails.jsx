import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AdminLoadDetails.css';
import { getAllLoadsByAdmin, updateLoadStatus } from '../../services/adminService';
import ApprovalModal from '../../components/common/ApprovalModal'; // 🚩 Onay Modalı
import ToastManager from '../../components/common/ToastManager';   // 🚩 Toast Sistemi

const AdminLoadDetails = () => {
  const { loadId } = useParams();
  const navigate = useNavigate();

  const [load, setLoad] = useState(null);
  const [status, setStatus] = useState('');

  // --- BİLDİRİM SİSTEMİ (8 SANİYE) ---
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, 8000);
  };

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadStatusOptions = [
    'YAYINDA',
    'TEKLIF_ALDI',
    'TEKLIF_BEKLIYOR',
    'TEKLIF_KABUL_EDILDI',
    'IPTAL_EDILDI',
    'YUKLENIYOR',
    'YUKLENDI',
    'TESLIM_EDILDI',
    'DEGERLENDIRME_BEKLIYOR'
  ];

  useEffect(() => {
    getAllLoadsByAdmin().then(data => {
      const found = data.find(item => String(item.id) === loadId);
      if (!found) {
        addToast('Yük bulunamadı!', 'error');
        navigate('/admin/dashboard');
        return;
      }
      setLoad(found);
      setStatus(found.durum);
    });
  }, [loadId, navigate]);

  // 🚩 Güncelleme işlemini yapan asıl fonksiyon
  const handleActualUpdate = async () => {
    setIsModalOpen(false); // Modalı kapat
    try {
      if (!load) return;
      await updateLoadStatus(load.id, status);
      addToast('✅ Durum başarıyla güncellendi', 'success');
      
      // Bildirimden sonra kullanıcıya zaman tanımak için kısa bir gecikmeyle yönlendir
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err) {
      addToast('❌ Güncelleme sırasında hata oluştu.', 'error');
    }
  };

  if (!load) return <div className="admin-loading">Yükleniyor...</div>;

  return (
    <div className={styles.container}>
      {/* 🚩 ToastManager'ı ekledik */}
      <ToastManager toasts={toasts} />

      <div className="sticky-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ⬅ Geri Dön
        </button>
      </div>

      <h1>📦 Yük Detayı</h1>

      <div className={styles.card}>
        <p><b>ID:</b> {load?.id}</p>
        <p><b>Yük Tipi:</b> {load?.yukTipi}</p>
        <p><b>Açıklama:</b> {load?.aciklama}</p>
        <p><b>Teslim Tarihi:</b> {load?.teslimTarihi ? new Date(load.teslimTarihi).toLocaleString() : '—'}</p>

        <label>Durum</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          {loadStatusOptions.map(s => (
            <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
          ))}
        </select>

        {/* 🚩 Direkt güncellemek yerine önce onay modalını açar */}
        <button onClick={() => setIsModalOpen(true)}>
          Durumu Güncelle
        </button>
      </div>

      {/* 🚩 MODERN ONAY MODALI */}
      <ApprovalModal 
        isOpen={isModalOpen}
        title="Durum Güncelleme"
        message={`Yük durumunu "${status.replaceAll('_', ' ')}" olarak değiştirmek istediğinizden emin misiniz?`}
        onConfirm={handleActualUpdate}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default AdminLoadDetails;  