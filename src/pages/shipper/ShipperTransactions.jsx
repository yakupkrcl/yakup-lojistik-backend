import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as transactionService from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';
import ToastManager from '../../components/common/ToastManager';
import './ShipperTransactions.css';

function ShipperTransactions() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const data = await transactionService.getShipperTransactions(user.id);
                // Sadece sıralama yaptık, yapıyı bozmadık
                const sortedData = Array.isArray(data) 
                    ? [...data].sort((a, b) => b.id - a.id) 
                    : [];
                setTransactions(sortedData);
            } catch (err) {
                addToast("İşlemler yüklenirken bir hata oluştu.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [user?.id]);

    if (loading) return <div className="shipper-container-msg">İşlemler yükleniyor...</div>;

    return (
        <div className="shipper-transactions-container">
            <div className="sticky-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ⬅ Geri Dön
                </button>
            </div>
   
            <div className="header-section">
                <h2>💳 Finansal İşlem Geçmişi</h2>
                <p>Kabul ettiğiniz teklifler ve ödeme durumlarını buradan takip edebilirsiniz.</p>
            </div>

            {transactions.length === 0 ? (
                <div className="shipper-container-msg">Henüz bir finansal işleminiz bulunmamaktadır.</div>
            ) : (
                <table className="shipper-table">
                    <thead>
                        <tr>
                            <th>Referans No</th> 
                            <th>İlgili Yük</th>
                            <th>Taşıyıcı (Şoför)</th>
                            <th>Ödeme Tutarı</th>
                            <th>İşlem Tarihi</th>
                            <th>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => {
                            // Backend'den gelebilecek farklı isimlendirmelere karşı koruma
                            const yuk = tx.yuk || tx.teklif?.yuk || {};
                            return (
                                <tr key={tx.id}>
                                    <td className="ref-cell">TR-{tx.id + 1000}</td> 
                                    <td>
                                        <div className="yuk-info">
                                            <strong>{yuk.aciklama || tx.yukTipi || 'Genel Yük'}</strong>
                                            <span>
                                                {tx.kalkisSehri || '-'} → {tx.varisSehri || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="driver-cell">
                                        {tx.tasiyiciAdSoyad ? (
                                            <span className="driver-name">👤 {tx.tasiyiciAdSoyad}</span>
                                        ) : (
                                            <span className="no-driver">⏳ Beklemede</span>
                                        )}
                                    </td>
                                    <td className="amount-cell">{tx.miktar?.toLocaleString()} TL</td>
                                    <td>{tx.olusturulmaTarihi ? new Date(tx.olusturulmaTarihi).toLocaleDateString('tr-TR') : '-'}</td>
                                    <td>
                                        <span className={`status-badge ${tx.durum?.toLowerCase()}`}>
                                            {tx.durum === 'BEKLEMEDE' || tx.durum === 'PENDING' ? 'Onay Bekliyor' : 
                                             tx.durum === 'TAMAMLANDI' || tx.durum === 'COMPLETED' ? 'Ödendi' : 
                                             tx.durum === 'REDDEDILDI' ? 'İptal Edildi' : tx.durum}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            
            <ToastManager toasts={toasts} />
        </div>
    );
}

export default ShipperTransactions;