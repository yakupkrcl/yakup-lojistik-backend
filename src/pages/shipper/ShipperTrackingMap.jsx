import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api'; // 🚩 Merkezi API'ye geçtik
import ToastManager from '../../components/common/ToastManager';
import 'leaflet/dist/leaflet.css';

// Kamyon ikonu
const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

function RecenterMap({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position && position[0] !== 0) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);
    return null;
}

function ShipperTrackingMap() {
    const { loadId } = useParams();
    const navigate = useNavigate();
    const [position, setPosition] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [toasts, setToasts] = useState([]);
    const lastToastRef = useRef(null);

    const removeToast = useCallback((id) => {
        setToasts(current => current.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'success') => {
        if (lastToastRef.current === message) return;
        const id = Date.now();
        lastToastRef.current = message;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
            lastToastRef.current = null;
        }, 5000);
    }, [removeToast]);

const fetchCurrentLocation = useCallback(async () => {
    console.log("📡 [DEBUG] Backend'den konum isteniyor... ID:", loadId); // Bunu ekle
    try {
        const res = await api.get(`/loads/${loadId}/current-location`);
        if (!res.data) return;

        const { durum, currentLat, currentLng } = res.data;

        // 1. Teslimat bittiyse yönlendir
        if (durum === 'TESLIM_EDILDI' || durum === 'TAMAMLANDI') {
            addToast("🏁 Yük teslim edildi! Takip kapatılıyor.", "success");
            setTimeout(() => navigate('/shipper/loads'), 3000);
            return;
        }

        // 2. Konum varsa state güncelle
        if (currentLat && currentLng) {
            console.log(`%c📡 [TAKİP] Şoförden Yeni Sinyal Geldi: Lat: ${res.data.currentLat}, Lng: ${res.data.currentLng}`, "color: #2196F3; font-weight: bold;");
            setPosition([currentLat, currentLng]);
            setLastUpdate(new Date().toLocaleTimeString());
        } else {
            console.log("🚚 Şoförün konumu henüz güncellenmedi...");
        }

    } catch (err) {
        if (err.response?.status === 404) {
            console.log("📍 Konum henüz hazır değil...");
        } else {
            console.error("🚨 Takip hatası:", err);
        }
    }
}, [loadId, addToast, navigate]);
useEffect(() => {
    fetchCurrentLocation(); // İlk açılışta çek
    
    const interval = setInterval(() => {
        // Eğer sayfa görünür değilse boşuna istek atma (browser optimizasyonu)
        if (document.visibilityState === 'visible') {
            fetchCurrentLocation();
        }
    }, 10000); // 10 saniye idealdir knk, bekend nefes alsın
    
    return () => clearInterval(interval);
}, [fetchCurrentLocation]);
    return (
        <div style={{ height: "100vh", width: "100%", position: "relative" }}>
            <ToastManager toasts={toasts} removeToast={removeToast} />
            <div className="tracking-panel" style={{ position: "absolute", top: 20, left: 20, zIndex: 1000, background: "white", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
                <button onClick={() => navigate(-1)} style={{ width: "100%", padding: "10px", background: "#333", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>⬅ Geri Dön</button>
                <h4 style={{ margin: "10px 0 5px 0" }}>🚚 Canlı Takip: #{loadId}</h4>
                {lastUpdate && <small style={{ color: "#4CAF50" }}>Son Sinyal: {lastUpdate}</small>}
            </div>
            <MapContainer center={[39.9, 32.8]} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {position && (
                    <>
                        <Marker position={position} icon={truckIcon}><Popup>Araç Burada</Popup></Marker>
                        <RecenterMap position={position} />
                    </>
                )}
            </MapContainer>
        </div>
    );
}

export default ShipperTrackingMap;