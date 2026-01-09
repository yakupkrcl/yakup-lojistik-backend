import React, { useState, useEffect, useRef } from 'react';
import styles from './NotificationBell.module.css';

const NotificationBell = ({ items = [], count = 0, onRefresh, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dışarı tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleItemClickInternal = (e, n) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onItemClick) onItemClick(n);
  };

  return (
    <div className={styles.bellWrapper} ref={dropdownRef}>
      <div className={styles.iconContainer} onClick={handleToggle}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {count > 0 && <span className={styles.badge}>{count}</span>}
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h4>Bildirimler</h4>
            {onRefresh && <button onClick={(e) => { e.stopPropagation(); onRefresh(); }} className={styles.refreshBtn}>🔄</button>}
          </div>
          
          <div className={styles.listWrapper}>
            {items.length > 0 ? items.map(n => {
              const isUnread = !(n.okundu || n.isRead);
              return (
                <div 
                  key={n.id} 
                  className={`${styles.item} ${isUnread ? styles.unread : ''}`}
                  onClick={(e) => handleItemClickInternal(e, n)}
                >
                  <div className={styles.itemContent}>
                    <p>{n.message || n.mesaj}</p>
                    <span className={styles.time}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}) : "Şimdi"}
                    </span>
                  </div>
                  {isUnread && <div className={styles.unreadDot} />}
                </div>
              );
            }) : (
              <div className={styles.empty}>Bildirim bulunmuyor.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;