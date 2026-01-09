import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as offerService from '../../services/offerService';
import './AdminWallet.css';

function AdminWallet() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [totals, setTotals] = useState({ gross: 0, profit: 0, driverShare: 0 });
    const [totalEscrow, setTotalEscrow] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinance = async () => {
            try {
                const allOffers = await offerService.getAllOffersAdmin();
                
                // 1. Tamamlanmış işlemler (Reel Kazanç)
                const completed = allOffers.filter(o => o.durum === 'TAMAMLANDI');
                const gross = completed.reduce((sum, o) => sum + (Number(o.teklifFiyati) || 0), 0);
                
                // Hassas hesaplama: Kârı kuruş hatası olmaması için yuvarlıyoruz
                const profit = Math.round(gross * 0.10 * 100) / 100;
                
                // 2. Havuzdaki işlemler (Kabul edilmiş ama henüz teslim edilmemiş)
                const inEscrow = allOffers
                    .filter(o => ['KABUL_EDILDI', 'YUKLENDI', 'YOLDA'].includes(o.durum))
                    .reduce((sum, o) => sum + (Number(o.teklifFiyati) || 0), 0);

                setTotals({ 
                    gross, 
                    profit, 
                    driverShare: Math.round((gross - profit) * 100) / 100 
                });
                setTotalEscrow(inEscrow);
                setHistory(allOffers.sort((a, b) => b.id - a.id));
            } catch (err) {
                console.error("Admin finans hatası:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFinance();
    }, []);

    if (loading) return <div className="admin-loading">Finansal veriler hesaplanıyor...</div>;

    return (
        <div className="admin-wallet-container">
            <header className="wallet-header-premium">
                <button onClick={() => navigate('/admin/dashboard')} className="back-btn-premium">
                    <span className="icon">←</span> Dashboard
                </button>
                <h2>Sistem Finansal Kontrol Merkezi 🏦</h2>
            </header>

            <div className="premium-balance-board">
                <div className="balance-box main">
                    <span className="label">Net Komisyon Geliri (%10)</span>
                    <h1>{totals.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</h1>
                    <div className="tag green">Tahsil Edildi</div>
                </div>
                
                <div className="balance-box side">
                    <div className="sub-item">
                        <label>Güvenli Havuz (Escrow)</label>
                        <h3 className="escrow-text">{totalEscrow.toLocaleString('tr-TR')} TL</h3>
                        <p className="description">Henüz tamamlanmamış operasyon hacmi</p>
                    </div>
                    <div className="sub-item">
                        <label>Toplam Brüt Hacim</label>
                        <h3>{totals.gross.toLocaleString('tr-TR')} TL</h3>
                        <p className="description">Tamamlanan tüm sevkiyat bedelleri</p>
                    </div>
                </div>
            </div>

            <div className="admin-history-section">
                <div className="section-header">
                    <h3>Finansal Hareketler</h3>
                    <div className="filter-badge">Son {history.length} İşlem</div>
                </div>
                
                <div className="admin-table-wrapper">
                    <table className="admin-finance-table">
                        <thead>
                            <tr>
                                <th>İşlem ID</th>
                                <th>Yük Bilgisi</th>
                                <th>İşlem Tutarı</th>
                                <th>Durum</th>
                                <th>Sistem Komisyonu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(item => {
                                const isCompleted = item.durum === 'TAMAMLANDI';
                                const itemProfit = (Number(item.teklifFiyati) * 0.10).toFixed(2);

                                return (
                                    <tr key={item.id} className={isCompleted ? 'row-completed' : ''}>
                                        <td><strong>#{item.id}</strong></td>
                                        <td>Yük #{item.yukId || 'N/A'}</td>
                                        <td className="amount">{Number(item.teklifFiyati).toLocaleString()} TL</td>
                                        <td>
                                            <span className={`admin-status-pill status-${item.durum?.toLowerCase()}`}>
                                                {item.durum?.replaceAll('_', ' ')}
                                            </span>
                                        </td>
                                        <td className={`profit-col ${isCompleted ? 'positive' : 'pending'}`}>
                                            {isCompleted ? `+ ${itemProfit} TL` : 'Beklemede'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminWallet;