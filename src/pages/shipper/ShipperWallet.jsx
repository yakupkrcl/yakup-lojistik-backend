import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as transactionService from '../../services/transactionService';
import api from '../../services/api';
import './ShipperWallet.css';
import { useAuth } from '../../context/AuthContext';

const ShipperWallet = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // AuthContext'ten güncel kullanıcıyı alıyoruz
    
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalSpent, setTotalSpent] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [escrowBalance, setEscrowBalance] = useState(0);

    // 🚩 fetchWalletData'yı useCallback içine alıyoruz ki useEffect her seferinde yeniden tetiklenmesin
    const fetchWalletData = useCallback(async () => {
        try {
            setLoading(true);
            
            // 1. İşlem geçmişini çek
            const txData = await transactionService.getShipperTransactions();
            const safeTxData = Array.isArray(txData) ? txData : [];
            
            // Tarihe göre sırala
            const sortedTxData = [...safeTxData].sort((a, b) => b.id - a.id);
            setTransactions(sortedTxData);

            // 2. Havuzdaki (Bloke) parayı hesapla
            const pending = safeTxData
                .filter(t => t.durum === 'BEKLEMEDE' || t.durum === 'PENDING')
                .reduce((sum, t) => sum + Number(t.miktar || 0), 0);
            setEscrowBalance(pending);

        const userRes = await api.get("/users/profile");

// 🚩 Önceliği 'balance' kelimesine ver (DB'de öyle çünkü)
const bakiye = userRes.data.balance !== undefined ? userRes.data.balance : (userRes.data.bakiye ?? 0);
setCurrentBalance(bakiye);
            // 4. Tamamlanmış harcamaların toplamı
            const total = safeTxData
                .filter(t => t.durum === 'TAMAMLANDI' || t.durum === 'COMPLETED')
                .reduce((sum, t) => sum + Number(t.miktar || 0), 0);
            setTotalSpent(total);

        } catch (err) {
            console.error("Cüzdan verileri çekilirken hata:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.id) { 
            fetchWalletData();
        }
    }, [user?.id, fetchWalletData]); // 🚩 Kullanıcı değiştiğinde veya fonksiyon tazelendiğinde çalışır

    if (loading) return <div className="wallet-loading">Finansal Veriler Hazırlanıyor...</div>;

    return (
        <div className="wallet-container">
            <div className="wallet-header-nav">
                <button onClick={() => navigate(-1)} className="back-link">← Geri Dön</button>
                <h2>Hesap Özeti ve Ödemeler</h2>
            </div>

            <div className="wallet-top-grid">
                <div className="main-balance-card current-balance">
                    <div className="card-chip gold"></div>
                    <p className="card-label">Kullanılabilir Nakit Bakiye</p>
                    <h1 className="balance-amount">{currentBalance.toLocaleString('tr-TR')} ₺</h1>
                    <div className="card-footer">
                        <span>🛡️ Güvenli Ödeme Sistemi</span>
                        <span className="card-brand">VISA / WALLET</span>
                    </div>
                </div>

                <div className="side-stats">
                    <div className="small-stat-box orange">
                        <small>Yolda / Bloke Edilen Tutar</small>
                        <p>{escrowBalance.toLocaleString('tr-TR')} ₺</p>
                        <span className="stat-info">Teslimatta şoföre aktarılacaktır.</span>
                    </div>
                    <div className="small-stat-box green">
                        <small>Tamamlanan Toplam Gider</small>
                        <p>{totalSpent.toLocaleString('tr-TR')} ₺</p>
                        <span className="stat-info">Bugüne kadar yapılan ödemeler.</span>
                    </div>
                </div>
            </div>

            <div className="history-section">
                <h3>Son İşlemler</h3>
                <div className="transaction-table-wrapper">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>İşlem / Yük</th>
                                <th>Tarih</th>
                                <th>Durum</th>
                                <th>Tutar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? transactions.map(t => (
                                <tr key={t.id}>
                                    <td>
                                        <div className="tx-desc">
                                            <strong>Yük Sevkiyatı #{t.yuk?.id || t.id}</strong>
                                            <span>{t.kalkisSehri} ➔ {t.varisSehri}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(t.olusturulmaTarihi || t.tarih || Date.now()).toLocaleDateString('tr-TR')}</td>
                                    <td>
                                        <span className={`status-badge ${t.durum?.toLowerCase()}`}>
                                            { (t.durum === 'BEKLEMEDE' || t.durum === 'PENDING') ? '⏳ Havuzda' : '✅ Tamamlandı'}
                                        </span>
                                    </td>
                                    <td className="amount-cell">-{t.miktar?.toLocaleString()} ₺</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="no-data">İşlem geçmişi bulunamadı.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ShipperWallet;