

import React from 'react';
import styles from './OfferCard.module.css';

const OfferCard = ({ offer, loadTitle }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'KABUL_EDILDI':
                return styles.accepted;
            case 'REDDEDILDI':
                return styles.rejected;
            default:
                return styles.pending;
        }
    };

    return (
        <div className={styles.card}>
            <h3>Teklif Detayları</h3>
            <p><strong>Yük:</strong> {loadTitle || 'Yük Detayı Yok'}</p>
            <p><strong>Teklif Edilen Fiyat:</strong> {offer.teklifFiyati} TL</p>
            <p>
                <strong>Durum:</strong> 
                <span className={`${styles.status} ${getStatusClass(offer.teklifDurumu)}`}>
                    {offer.teklifDurumu}
                </span>
            </p>
            <p className={styles.date}>Teklif Tarihi: {new Date(offer.olusturmaTarihi).toLocaleDateString()}</p>
        </div>
    );
};

export default OfferCard;