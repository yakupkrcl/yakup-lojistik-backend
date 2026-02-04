import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// ✅ Default ikon ayarları
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// ✅ Haritayı koordinat değiştikçe otomatik kaydıran yardımcı bileşen
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom()); // Haritayı yeni merkeze yumuşakça kaydırır
    }
  }, [center, map]);
  return null;
}

const RouteMap = ({ currentLocation, destination }) => {
  const hasCurrent = currentLocation && currentLocation[0] !== 0 && currentLocation[1] !== 0;
  const hasDest = destination && destination[0] && destination[1];

  // Başlangıç merkezi belirleme
  const center = hasCurrent
    ? currentLocation
    : hasDest
    ? destination
    : [39, 35];

  return (
    <div style={{ height: '220px', borderRadius: 12, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={10} style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* ✅ Dinamik odaklama bileşeni burada devreye giriyor */}
        <RecenterMap center={center} />

        {hasCurrent && (
          <Marker position={currentLocation}>
            <Popup>🚛 Sürücü Konumu</Popup>
          </Marker>
        )}

        {hasDest && (
          <Marker position={destination}>
            <Popup>📍 Varış Noktası</Popup>
          </Marker>
        )}

        {hasCurrent && hasDest && (
          <Polyline
            positions={[currentLocation, destination]}
            pathOptions={{
              color: '#1e90ff',
              weight: 5,
              dashArray: '1 12',
              lineCap: 'round'
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default RouteMap;