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
            setModalConfig(prev => ({ ...prev, isOpen: false }));
            fetchData();
        } catch (err) {
            addToast(err.response?.data?.message || 'Hata oluştu', 'error');
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
                                        <div className="driver-avatar">{(offer.tasiyici?.firstName || 'T').charAt(0)}</div>
                                        <div className="driver-details">
                                            <strong>{offer.tasiyici?.firstName} {offer.tasiyici?.lastName}</strong>
                                            <span>⭐ 4.8</span>
                                        </div>
                                    </div>
                                </td>
                                <td><div className="offer-note-box">{offer.note || "-"}</div></td>
                                <td className="price-cell">{offer.teklifFiyati?.toLocaleString()} TL</td>
                                <td><span className={`status-pill ${offer.durum?.toLowerCase()}`}>{offer.durum}</span></td>
                                <td className="text-center">
                                    {offer.durum === 'BEKLEMEDE' ? (
                                        <div className="action-buttons">
                                            {/* YANIP SÖNEN BUTON: pulse-animation eklendi */}
                                            <button className="btn accept pulse-animation" onClick={() => openStatusModal(offer.id, 'KABUL')}>
                                                Onayla
                                            </button>
                                            <button className="btn reject" onClick={() => openStatusModal(offer.id, 'RED')}>Reddet</button>
                                        </div>
                                    ) : (
                                        <span className="action-status">{offer.durum === 'KABUL_EDILDI' ? '✅ Seçildi' : '➖'}</span>
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
                )}
            </ApprovalModal>
        </div>
    );
}

export default ShipperOfferManager;