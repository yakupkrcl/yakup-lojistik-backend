import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationBell.module.css';

const NotificationBell = ({ items = [], count = 0, onRefresh, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleItemClick = (notification) => {
    const type = notification.type;

    // --- 1. YÜK SAHİBİ (SHIPPER) MANTIĞI ---
    const isDelivery = type === 'DELIVERED' || type === 'TESLIM_EDILDI';
    if (isDelivery && notification.loadId) {
      navigate('/shipper/completed-loads', { 
        state: { autoOpenRating: true, loadId: notification.loadId } 
      });
    } 

    // --- 2. SÜRÜCÜ (DRIVER) MANTIĞI ---
    else if (type === 'OFFER_ACCEPTED' || type === 'TEKLIF_KABUL') {
      navigate('/driver/active-loads');
    } 
    else if (type === 'NEW_LOAD' || type === 'YENI_YUK') {
      navigate('/driver/available-loads');
    }
    else if (type === 'PAYMENT_COMPLETED' || type === 'ODEME_ONAY') {
      navigate('/driver/wallet');
    }

    // Genel tıklama fonksiyonunu (markAsRead vb.) tetikle
    if (onItemClick) {
      onItemClick(notification);
    }
    
    setIsOpen(false); // Menüyü kapat
  };

  return (
    <div className={styles.bellWrapper}>
      <div className={styles.iconContainer} onClick={() => setIsOpen(!isOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {count > 0 && <span className={styles.badge}>{count}</span>}
      </div>

      {isOpen && (
        <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
          <div className={styles.dropdownHeader}>
            <h4>Bildirimler</h4>
            {onRefresh && <button onClick={onRefresh} className={styles.refreshBtn}>🔄</button>}
          </div>
          
          <div className={styles.listWrapper}>
            {items.length > 0 ? items.map(n => {
              const isAlreadyRead = n.okundu || n.isRead; 
              const isDelivery = n.type === 'DELIVERED' || n.type === 'TESLIM_EDILDI';

              return (
                <div 
                  key={n.id} 
                  className={`${styles.item} ${!isAlreadyRead ? styles.unread : ''}`}
                  onClick={() => handleItemClick(n)}
                >
                  <div className={styles.itemContent}>
                    <p>{n.message || n.mesaj}</p>
                    
                    {/* Yük Sahibi için Puanla Butonu */}
                    {isDelivery && (
                      <button 
                        className={styles.rateButtonInside}
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleItemClick(n);
                        }}
                      >
                        Hemen Puanla ⭐
                      </button>
                    )}

                    <span className={styles.time}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "Şimdi"}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <p className={styles.empty}>Henüz bildirim yok</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;