import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createOfferByDriver } from '../../services/offerService';
import * as loadService from '../../services/loadService';
import ToastManager from '../../components/common/ToastManager';
import './DriverMakeOffer.css';

function DriverMakeOffer() {
    const { loadId } = useParams();
    const navigate = useNavigate();

    const [load, setLoad] = useState(null);
    const [offerAmount, setOfferAmount] = useState('');
    const [driverNote, setDriverNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingLoad, setIsLoadingLoad] = useState(true);
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000); 
    };

    const fetchLoadDetails = useCallback(async () => {
        try {
            const response = await loadService.getLoadDetails(loadId);
            setLoad(response.data ?? response);
        } catch (err) {
            addToast('Yük detayları alınamadı.', 'error');
        } finally {
            setIsLoadingLoad(false);
        }
    }, [loadId]);

    useEffect(() => { fetchLoadDetails(); }, [fetchLoadDetails]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const amount = Number(offerAmount);
        if (!amount || amount <= 0) {
            addToast('Geçerli bir teklif girin.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await createOfferByDriver({
                yukId: Number(loadId),
                teklifFiyati: amount,
                note: driverNote 
            });
            addToast('Teklif başarıyla gönderildi ve kaydedildi.', 'success');
            setTimeout(() => navigate('/driver/my-offers'), 2000);
        } catch (err) {
            addToast(err.response?.data?.message || 'Teklif gönderilemedi.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingLoad) return <div className="make-offer-container">Yükleniyor...</div>;
    if (!load) return <div className="make-offer-container">Yük bulunamadı.</div>;

    return (
        <div className="make-offer-container">
            <button className="back-btn" onClick={() => navigate(-1)}>⬅ Geri Dön</button>
            <h2>💰 Teklif Ver: {load.kalkisAdresi?.sehir} - {load.varisAdresi?.sehir}</h2>

            <form onSubmit={handleSubmit} className="offer-form">
                <div className="form-group">
                    <label>Teklif Fiyatı (TL)</label>
                    <input
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label>Not (Opsiyonel)</label>
                    <textarea
                        value={driverNote}
                        onChange={(e) => setDriverNote(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'İşleniyor...' : 'Teklifi Onayla ve Gönder'}
                </button>
            </form>
            <ToastManager toasts={toasts} />
        </div>
    );
}

export default DriverMakeOffer;