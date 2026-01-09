import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const RouteMap = ({ currentLocation, destination }) => {
  const hasCurrent =
    currentLocation && currentLocation[0] && currentLocation[1];

  const hasDest =
    destination && destination[0] && destination[1];

  const center = hasCurrent
    ? currentLocation
    : hasDest
    ? destination
    : [39, 35];

  return (
    <div style={{ height: '220px', borderRadius: 12, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={6} style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
     dashArray: '1 12'
,
      lineCap: 'round'
    }}
  />
)}

      </MapContainer>
    </div>
  );
};

export default RouteMap;
