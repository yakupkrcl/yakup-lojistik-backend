import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as offerService from '../../services/offerService';
import './DriverWallet.css';

function DriverWallet() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totals, setTotals] = useState({ gross: 0, net: 0, tax: 0 });

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                setIsLoading(true);
                const myOffers = await offerService.getMyOffers();
                
                // Sadece tamamlanan işleri al
                const completed = myOffers.filter(o => o.durum === 'TAMAMLANDI' || o.durum === 'COMPLETED');
                
                const gross = completed.reduce((sum, o) => sum + (Number(o.teklifFiyati) || 0), 0);
                const tax = gross * 0.10; // %10 Komisyon
                const net = gross - tax;

                setTotals({ gross, net, tax });
                setTransactions(completed.sort((a, b) => b.id - a.id));
            } catch (error) {
                console.error("Cüzdan verisi çekilemedi:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWalletData();
    }, []);

    if (isLoading) return <div className="loader">Cüzdan Hazırlanıyor...</div>;

    return (
        <div className="wallet-container">
            <header className="wallet-header">
                <button onClick={() => navigate(-1)} className="back-btn">← Panel</button>
                <h2>Mali Özetim</h2>
            </header>

            {/* Üst Özet Kartları */}
            <div className="balance-cards">
                <div className="balance-card main">
                    <span className="label">Kullanılabilir Net Bakiye</span>
                    <h1 className="amount">{totals.net.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h1>
                    <div className="status-tag">✓ Ödemeye Hazır</div>
                </div>
                <div className="balance-card secondary">
                    <span className="label">Toplam Kazanç (Brüt)</span>
                    <h3>{totals.gross.toLocaleString('tr-TR')} TL</h3>
                    <span className="label">Sistem Komisyonu (%10)</span>
                    <h3 className="tax-amount">-{totals.tax.toLocaleString('tr-TR')} TL</h3>
                </div>
            </div>

            {/* İşlem Geçmişi */}
            <div className="history-section">
                <h3>İşlem Geçmişi</h3>
                <div className="transaction-list">
                    {transactions.length > 0 ? transactions.map(item => (
                        <div key={item.id} className="transaction-item">
                            <div className="trans-info">
                                <strong>Yük #{item.loadId || item.id}</strong>
                                <span>{new Date().toLocaleDateString('tr-TR')} • Tamamlandı</span>
                            </div>
                            <div className="trans-amount">
                                <span className="gross">+{item.teklifFiyati} TL</span>
                                <span className="net">Net: {(item.teklifFiyati * 0.9).toFixed(0)} TL</span>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state">Henüz tamamlanmış bir işleminiz bulunmuyor.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DriverWallet;