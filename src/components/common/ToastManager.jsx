// src/components/common/ToastManager.jsx
import React from 'react';
import './Toast.css';

const ToastManager = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card ${toast.type || 'info'}`}>
          <div className="toast-content">
            <span>{toast.message}</span>
          </div>
          <button className="close-btn" onClick={() => removeToast(toast.id)}>×</button>
        </div>
      ))}
    </div>
  );
};

export default ToastManager;