import React, { useState,useEffect, useCallback } from "react";
import { uploadDriverDocument, getDriverDocuments } from "../../services/documentService";
import styles from "./DriverDocuments.module.css";
import ToastManager from "../../components/common/ToastManager";
import ApprovalModal from "../../components/common/ApprovalModal";

const initialDocs = [
  { label: "Ehliyet Ön Yüz", value: "EHLIYET_ON" },
  { label: "Ehliyet Arka Yüz", value: "EHLIYET_ARKA" },
  { label: "SRC Belgesi", value: "SRC_BELGESI" },
  { label: "Psikoteknik Belgesi", value: "PSIKOTEKNIK_BELGESI" },
  { label: "Araç Ruhsatı", value: "ARAC_RUHSATI" },
];

export default function DriverDocuments() {
    const [pageLoading, setPageLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [docStatuses, setDocStatuses] = useState(
    initialDocs.reduce((acc, curr) => ({ ...acc, [curr.value]: "BEKLEMEDE" }), {})
  );
  const [loading, setLoading] = useState({});
  const [toasts, setToasts] = useState([]);
  
  // Modal Yönetimi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(null);

 const addToast = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // 🚩 8 saniye sonra otomatik silinsin
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 8000);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) setSelectedFiles((prev) => ({ ...prev, [type]: file }));
  };
const fetchDocumentStatuses = useCallback(async () => {
  try {
    setPageLoading(true);
    const data = await getDriverDocuments(); 
    
    const statusMap = initialDocs.reduce((acc, doc) => {
      // 🚩 Backend'deki alan adı 'belgeTipi'
      const serverDoc = data.find(d => d.belgeTipi === doc.value);
      
      if (serverDoc) {
        // Backend'den 'ONAYLANDI' gelirse frontend'de yeşil yakmak için 'TAMAMLANDI' yapıyoruz
        acc[doc.value] = serverDoc.status === "ONAYLANDI" ? "TAMAMLANDI" : serverDoc.status;
      } else {
        acc[doc.value] = "BEKLEMEDE";
      }
      return acc;
    }, {});
    
    setDocStatuses(statusMap);
  } catch (err) {
    console.error("Belge durumları çekilemedi:", err);
    addToast("Belgeleriniz yüklenirken bir sorun oluştu.", "error");
  } finally {
    setPageLoading(false);
  }
}, [addToast]);

  useEffect(() => {
    fetchDocumentStatuses();
  }, [fetchDocumentStatuses]);

  // Modal'ı açan fonksiyon
  const openConfirmModal = (type) => {
    setPendingUpload(type);
    setIsModalOpen(true);
  };

  // Modal "Evet" deyince çalışan asıl yükleme fonksiyonu
  const confirmUpload = async () => {
    const type = pendingUpload;
    const file = selectedFiles[type];
    setIsModalOpen(false);

    try {
      setLoading((prev) => ({ ...prev, [type]: true }));
      await uploadDriverDocument(file, type);
      
      // 🚩 DEĞİŞİKLİK: Direkt TAMAMLANDI değil, "IN_REVIEW" (İncelemede) yapıyoruz
      setDocStatuses((prev) => ({ ...prev, [type]: "IN_REVIEW" })); 
      addToast("Belge yüklendi, yönetici onayı bekleniyor.", "success");
      
      setSelectedFiles(prev => {
        const newState = {...prev};
        delete newState[type];
        return newState;
      });
    } catch (err) {
      addToast("Yükleme başarısız oldu.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };
  if (pageLoading) return <div className={styles.loading}>Belge durumları kontrol ediliyor...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Belge Gönderim Paneli</h2>
      <div className={styles.list}>
        {initialDocs.map((doc) => {
          const status = docStatuses[doc.value];
          const isDone = status === "TAMAMLANDI" || status === "IN_REVIEW";
          
          return (
            <div key={doc.value} className={`${styles.rowCard} ${styles[status]}`}>
              <div className={styles.docInfo}>
                <h4>{doc.label}</h4>
                <span className={`${styles.statusBadge} ${styles[status]}`}>
                  {status === "TAMAMLANDI" ? "✅ ONAYLANDI" : 
                   status === "IN_REVIEW" ? "⏳ ONAY BEKLİYOR" : "❌ YÜKLENMEDİ"}
                </span>
              </div>

              <div className={styles.controls}>
                {!isDone && (
                  <label className={styles.fileLabel}>
                    {selectedFiles[doc.value] ? "📁 Seçildi" : "Dosya Seç"}
                    <input type="file" hidden onChange={(e) => handleFileSelect(e, doc.value)} />
                  </label>
                )}

                <button
                  className={styles.uploadBtn}
                  onClick={() => openConfirmModal(doc.value)}
                  disabled={!selectedFiles[doc.value] || loading[doc.value] || isDone}
                >
                  {status === "TAMAMLANDI" ? "Onaylı" : 
                   status === "IN_REVIEW" ? "İncelemede" : 
                   loading[doc.value] ? "Yükleniyor..." : "Gönder"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ApprovalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={confirmUpload}
        title="Belge Yükleme Onayı"
        message="Seçtiğiniz belge sisteme yüklenecektir. Emin misiniz?"
      />

      <ToastManager toasts={toasts} removeToast={removeToast} />
    </div>
  );
}