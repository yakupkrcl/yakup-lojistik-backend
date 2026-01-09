import React, { useEffect, useState } from 'react';
import './AdminTransactions.css';
import { getAllTransactions } from '../../services/transactionService'; 
import { useNavigate } from 'react-router-dom';
import ToastManager from '../../components/common/ToastManager';

const AdminTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]); // Filtreleme için
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, 8000);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Arama filtresi tetiklendiğinde
  useEffect(() => {
    const results = transactions.filter(tx =>
      tx.yukSahibiEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.tasiyiciEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.kalkisSehri?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.varisSehri?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(results);
  }, [searchTerm, transactions]);
const fetchTransactions = async () => {
  try {
    setLoading(true);
    const data = await getAllTransactions(); 
    
    // 🚩 TARİHE GÖRE SIRALAMA (En yeni tarihli en üstte)
    const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.olusturulmaTarihi || 0);
        const dateB = new Date(b.olusturulmaTarihi || 0);
        return dateB - dateA; // Büyükten küçüğe
    });

    setTransactions(sortedData); 
    setFilteredTransactions(sortedData);
  } catch (error) {
    console.error('Hata:', error);
    addToast('Veriler yüklenirken hata oluştu!', 'error');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="admin-transactions-container">
      <ToastManager toasts={toasts} />

      <div className="sticky-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ⬅ Geri Dön
        </button>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Email veya şehir ile ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-header">
        <h1>Sistem Finansal Takibi</h1>
        <p>Toplam {transactions.length} işlem üzerinden sistem trafiği izleniyor.</p>
      </div>

      {loading ? (
        <div className="admin-loading">Veriler analiz ediliyor...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">
           <p>Eşleşen bir işlem bulunamadı.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Yük Sahibi & Güzergah</th>
                <th>Taşıyıcı</th>
                <th>Ödeme Detayı</th>
                <th>Komisyon</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx.id}>
                  <td><strong>#{tx.id}</strong></td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{tx.yukSahibiAdSoyad || tx.yukSahibiEmail}</span>
                      <small className="route-text">
                        📍 {tx.kalkisSehri} ➡️ {tx.varisSehri}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{tx.tasiyiciAdSoyad || tx.tasiyiciEmail}</span>
                    </div>
                  </td>
                  <td className="price-cell">
                    <div className="price-stack">
                      <span className="total-price">{tx.miktar?.toLocaleString()} TL</span>
                      <small className="price-note">İşlem Tutarı</small>
                    </div>
                  </td>
<td className="commission-cell">
  <span className="commission-amount">
    {/* tx.komisyonTutari olarak okuduğundan emin ol */}
    {tx.komisyonTutari ? `${tx.komisyonTutari.toLocaleString()} TL` : '0 TL'}
  </span>
</td>
                  <td>
                    <span className={`status-badge ${tx.durum?.toLowerCase()}`}>
                      {tx.durum}
                    </span>
                  </td>
                  <td className="date-cell">
                    {tx.olusturulmaTarihi 
                      ? new Date(tx.olusturulmaTarihi).toLocaleDateString('tr-TR', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'}) 
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;