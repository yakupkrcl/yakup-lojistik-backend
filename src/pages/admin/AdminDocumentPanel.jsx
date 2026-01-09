import React, { useEffect, useState, useCallback } from "react";
import { getAllDocuments, updateDocumentStatus } from "../../services/documentService";
import styles from "./AdminDocumentPanel.module.css";
import ToastManager from "../../components/common/ToastManager";
import ApprovalModal from "../../components/common/ApprovalModal";

export default function AdminDocumentPanel() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [toasts, setToasts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { id, status }

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await getAllDocuments();
      // Yeni yüklenenleri en üstte görmek için tarihe göre sırala
      const sortedData = data.sort((a, b) => new Date(b.yuklenmeTarihi) - new Date(a.yuklenmeTarihi));
      setDocuments(sortedData);
    } catch (err) {
      addToast("Veriler yüklenirken hata oluştu!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const openConfirm = (id, status) => {
    setPendingAction({ id, status });
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    const { id, status } = pendingAction;
    setIsModalOpen(false);
    try {
      await updateDocumentStatus(id, status);
      setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, status } : doc));
      addToast(`Belge başarıyla ${status.toLowerCase()} statusüne çekildi.`);
    } catch (e) {
      addToast("İşlem başarısız oldu!", "error");
    }
  };

  // 🚩 MODERN DÜZEN: Sürücü bazlı gruplama
  const filtered = documents.filter(doc => 
    searchId ? doc.yukleyenKullaniciId?.toString().includes(searchId) : true
  );

  if (loading) return <div className={styles.loadingWrapper}><div className={styles.loader}></div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.mainPanel}>
        <h2 className={styles.title}>🛡️ Belge Yönetim Sistemi</h2>

        <div className={styles.filterSection}>
          <input 
            type="text" 
            placeholder="Sürücü ID ile filtrele (Örn: 102)..." 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.statBox}>
             Bekleyen: <strong>{documents.filter(d => d.status === 'BEKLEMEDE').length}</strong>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SÜRÜCÜ</th>
                <th>BELGE TİPİ</th>
                <th>YÜKLENME TARİHİ</th>
                <th>DURUM</th>
                <th>AKSİYONLAR</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.driverInfo}>
                      <span className={styles.driverAvatar}>{doc.yukleyenKullaniciId}</span>
                      <span>Sürücü #{doc.yukleyenKullaniciId}</span>
                    </div>
                  </td>
                  <td className={styles.docType}>{doc.belgeTipi?.replace(/_/g, " ")}</td>
                  <td className={styles.date}>{new Date(doc.yuklenmeTarihi).toLocaleDateString("tr-TR")}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[doc.status?.toLowerCase()]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.btnGroup}>
                      <button 
                        className={styles.btnOnay}
                        disabled={doc.status === 'ONAYLANDI'}
                        onClick={() => openConfirm(doc.id, "ONAYLANDI")}
                      >Onayla</button>
                      <button 
                        className={styles.btnRed}
                        disabled={doc.status === 'REDDEDILDI'}
                        onClick={() => openConfirm(doc.id, "REDDEDILDI")}
                      >Reddet</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ApprovalModal 
        isOpen={isModalOpen}
        title="Durum Güncelleme"
        message={`${pendingAction?.id} numaralı belgeyi ${pendingAction?.status} yapmak istediğinize emin misiniz?`}
        onConfirm={handleConfirmAction}
        onCancel={() => setIsModalOpen(false)}
      />

      <ToastManager toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}