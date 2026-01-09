import React from 'react';
import './ApprovalModal.css';

// 🚩 { children } ekledik, bu sayede modalın içine yazdığımız butonlar görünecek
const ApprovalModal = ({ isOpen, title, message, onConfirm, onCancel, children }) => {
    if (!isOpen) return null;

    return (
        <div className="approval-overlay">
            <div className="approval-card">
                <div className="approval-icon">❓</div>
                <h3>{title}</h3>
                <p>{message}</p>
                
                {/* 🚩 BURASI ÇOK ÖNEMLİ: Manager'dan gelen Kart/Cüzdan seçimi burada belirecek */}
                {children && <div className="approval-custom-content">{children}</div>}

                <div className="approval-actions">
                    <button className="btn-cancel" onClick={onCancel}>Vazgeç</button>
                    <button className="btn-confirm" onClick={onConfirm}>Evet, Onayla</button>
                </div>
            </div>
        </div>
    );
};

export default ApprovalModal;