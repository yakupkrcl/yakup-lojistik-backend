import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ratingService from '../../services/ratingService';
import './MyRatings.css';

function MyRatings() {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
    const fetchRatings = async () => {
    try {
        setLoading(true);
        const data = await ratingService.getAllRatings();
        
        // 🚩 SORT: En yeni yorum en üstte (ID'ye göre)
        const sortedData = Array.isArray(data) 
            ? [...data].sort((a, b) => b.id - a.id) 
            : [];
            
        setRatings(sortedData);
    } catch (error) {
        console.error("Yorumlar çekilemedi:", error);
    } finally {
        setLoading(false);
    }
};
        fetchRatings();
    }, []);

    return (
        <div className="my-ratings-page">
            <div className="sticky-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ⬅ Geri Dön
            </button>
            </div>
            <header className="page-header">
                <h1>⭐ Değerlendirmelerim</h1>
                <p>Müşterilerinizin sizin hakkınızdaki görüşleri</p>
            </header>

            {loading ? (
                <div className="loading-state">Yorumlar yükleniyor...</div>
            ) : (
                <div className="ratings-grid">
                    {ratings.length === 0 ? (
                        <div className="no-ratings">Henüz bir değerlendirme almadınız.</div>
                    ) : (
                        ratings.map((r) => (
                            <div key={r.id} className="rating-card">
                                <div className="rating-card-header">
                                    <div className="reviewer-info">
                                        {/* Yorumu yazan kişinin adı ve soyadı */}
                                        <span className="reviewer-name">
                                            👤 {r.puanlayanAd} {r.puanlayanSoyad}
                                        </span>
                                    </div>
                                    <span className="rating-date">
                                        {r.olusturulmaTarihi ? new Date(r.olusturulmaTarihi).toLocaleDateString('tr-TR') : 'Yeni'}
                                    </span>
                                </div>

                                <div className="stars">
                                    {"⭐".repeat(r.puan)}
                                </div>

                                <div className="rating-body">
                                    <p className="comment">"{r.yorum}"</p>
                                </div>

                                <div className="rating-footer">
                                    {/* Yük numarası burada. Eğer gelmiyorsa r.yuk.id veya r.yukId dene */}
                                    <span className="load-tag">📦 Yük No: #{r.yukId || 'Belirtilmemiş'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default MyRatings;