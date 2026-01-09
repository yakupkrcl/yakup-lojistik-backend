import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as offerService from '../../services/offerService';
import * as loadService from '../../services/loadService';
import ApprovalModal from '../../components/common/ApprovalModal'; 
import ToastManager from '../../components/common/ToastManager'; 
import './ShipperOfferManager.css';

function ShipperOfferManager() {
    const { loadId } = useParams();
    const navigate = useNavigate();

    const [offers, setOffers] = useState([]);
    const [load, setLoad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState('CUZDAN');

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(current => current.filter(t => t.id !== id)), 6000); 
    };

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        offerId: null,
        status: null,
        title: '',
        message: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        
        try {
            const [loadRes, offerRes] = await Promise.all([
                loadService.getLoadDetails(loadId),
                offerService.getOffersByLoadId(loadId) 
            ]);
            setLoad(loadRes.data ?? loadRes);
            setOffers(offerRes.data ?? offerRes);
            console.log("Gelen Teklifler:", offerRes);
        } catch (err) {
            addToast('Bilgiler alınamadı.', 'error');
        } finally {
            setLoading(false);
        }
    }, [loadId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openStatusModal = (offerId, status) => {
        const isAccept = status === 'KABUL';
        setModalConfig({
            isOpen: true,
            offerId,
            status,
            title: isAccept ? '💳 Ödeme ve Onay' : '❌ Teklifi Reddet',
            message: isAccept 
                ? 'Lütfen bu sevkiyat için ödeme yöntemini seçiniz:' 
                : 'Bu teklifi reddetmek istediğinizden emin misiniz?'
        });
    };

const handleActualUpdate = async () => {
    const { offerId, status } = modalConfig;
    try {
        if (status === 'KABUL') {
            await offerService.acceptOffer(offerId, selectedPayment);
            addToast(`🚀 Teklif ${selectedPayment} ile onaylandı!`, 'success');
        } else {
            await offerService.rejectOffer(offerId);
            addToast('Teklif reddedildi.', 'info');
        }
        // Başarılı olduğunda zaten kapanıyor
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
    } catch (err) {
        // 🔥 KRİTİK DÜZELTME: Hata gelse bile modalı kapat ki Toast mesajı görünsün!
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        
        const errorMessage = err.response?.data?.message || 'Hata oluştu';
        addToast(errorMessage, 'error');
    }
};
    if (loading && !load) return <div className="loader">Yükleniyor...</div>;

    return (
        <div className="offer-manager-container">
            <ToastManager toasts={toasts} />

            <div className="sticky-header">
                <button className="back-btn" onClick={() => navigate(-1)}>⬅ Geri Dön</button>
            </div> 

            <header className="manager-header">
                <div className="header-left">
                    <h2>📦 {load?.kalkisAdresi?.sehir} ➜ {load?.varisAdresi?.sehir}</h2>
                    <div className="load-status-info">
                        Durum: <span className={`status-pill ${load?.durum?.toLowerCase()}`}>
                            {load?.durum}
                        </span>
                    </div>
                </div>

                {load?.deliveryCode && (
                    <div className="delivery-code-compact">
                        <span className="code-label">TESLİMAT KODU</span>
                        <strong className="code-value">{load.deliveryCode}</strong>
                    </div>
                )}
            </header>

            <div className="table-container">
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Taşıyıcı</th>
                            <th>Not</th>
                            <th>Fiyat</th>
                            <th>Durum</th>
                            <th className="text-center">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offers.map((offer) => (
                            <tr key={offer.id}>
                              <td>
    <div className="driver-cell">
        {/* İsmin ilk harfini dinamik alıyoruz, yoksa 'T' basıyoruz */}
{/* ShipperOfferManager.jsx - Avatar Kısmı */}
<div className="driver-avatar-icon">
            <span>👤</span> 
        </div>

{/* ShipperOfferManager.jsx - İsim Detay Kısmı */}
<div className="driver-details">
    <strong>
        {offer.tasiyici?.ad 
            ? `${offer.tasiyici.ad} ${offer.tasiyici.soyad}` 
            : "İsimsiz Taşıyıcı"}
    </strong>
    {/* Rating Backend DTO'da olmadığı için şimdilik gizleyebilir veya 0.0 bırakabilirsin */}
  <span>⭐ {offer.tasiyici?.rating !== null ? offer.tasiyici.rating.toFixed(1) : "0.0"}</span>
</div>
    </div>
</td>
                                <td><div className="offer-note-box">{offer.note || "-"}</div></td>
                                <td className="price-cell">{offer.teklifFiyati?.toLocaleString()} TL</td>
                                <td><span className={`status-pill ${offer.durum?.toLowerCase()}`}>{offer.durum}</span></td>
                           <td className="text-center">
    {offer.durum === 'BEKLEMEDE' ? (
        <div className="action-buttons">
            <button className="btn accept pulse-animation" onClick={() => openStatusModal(offer.id, 'KABUL')}>
                Onayla
            </button>
            <button className="btn reject" onClick={() => openStatusModal(offer.id, 'RED')}>
                Reddet
            </button>
        </div>
    ) : (
        /* Çizgi yerine burayı güncelledik knk */
        <div className="status-badge-container">
            {offer.durum === 'KABUL_EDILDI' ? (
                <span className="badge-selected">✅ Seçildi</span>
            ) : (
                <span className="badge-rejected">❌ Elendi</span>
            )}
        </div>
    )}
</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

          <ApprovalModal 
    isOpen={modalConfig.isOpen}
    title={modalConfig.title}
    message={modalConfig.message}
    onConfirm={handleActualUpdate}
    onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
>
    {modalConfig.status === 'KABUL' && (
        <>
            <div className="payment-selection-wrapper">
                <div className="payment-methods-grid">
                    <label className={`pay-option ${selectedPayment === 'CUZDAN' ? 'active' : ''}`}>
                        <input type="radio" value="CUZDAN" checked={selectedPayment === 'CUZDAN'} onChange={(e) => setSelectedPayment(e.target.value)} />
                        <div className="pay-content"><span>💰</span><span className="text">Cüzdan</span></div>
                    </label>
                    <label className={`pay-option ${selectedPayment === 'KREDI_KARTI' ? 'active' : ''}`}>
                        <input type="radio" value="KREDI_KARTI" checked={selectedPayment === 'KREDI_KARTI'} onChange={(e) => setSelectedPayment(e.target.value)} />
                        <div className="pay-content"><span>💳</span><span className="text">Kart</span></div>
                    </label>
                </div>
            </div>

           {selectedPayment === 'KREDI_KARTI' && (
    <div className="credit-card-form-container">
        <div className="card-input-group">
            <label>Kart Numarası</label>
            <input 
                type="text" 
                placeholder="xxxx xxxx xxxx xxxx" 
                maxLength="19" // Boşluklarla beraber 19 karakter
                onChange={(e) => {
                    // Sadece rakamları al ve her 4 rakamda bir boşluk ekle
                    let value = e.target.value.replace(/\D/g, '');
                    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                    e.target.value = value;
                }}
            />
        </div>
        <div className="card-row">
            <div className="card-input-group">
                <label>Son Kullanma</label>
                <input 
                    type="text" 
                    placeholder="AA/YY" 
                    maxLength="5"
                    onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 2) value = value.substring(0,2) + '/' + value.substring(2,4);
                        e.target.value = value;
                    }}
                />
            </div>
            <div className="card-input-group">
                <label>CVV</label>
                <input 
                    type="text" // password yerine text yapıp maskeleyebilirsin ya da böyle kalabilir
                    placeholder="***" 
                    maxLength="3"
                    onChange={(e) => {
                        e.target.value = e.target.value.replace(/\D/g, ''); // Harfleri siler
                    }}
                />
            </div>
        </div>
        <p className="card-note">ℹ️ Rakam dışında karakter girişi engellenmiştir.</p>
    </div>
)}
        </>
    )}
</ApprovalModal>
        </div>
    );
}

export default ShipperOfferManager;