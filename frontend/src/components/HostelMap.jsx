import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';

// Fix Leaflet default marker icon path issue in Vite
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to dynamically update map center when center prop changes
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

// Component for manager location picker click events
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({
          latitude: parseFloat(e.latlng.lat.toFixed(6)),
          longitude: parseFloat(e.latlng.lng.toFixed(6)),
        });
      }
    },
  });
  return null;
};

export const HostelMap = ({
  center = [12.9716, 77.5946],
  zoom = 13,
  markers = [],
  onLocationSelect = null,
  pickerPosition = null,
  height = '350px',
  className = '',
}) => {
  const validCenter =
    Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])
      ? center
      : [12.9716, 77.5946];

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0 ${className}`}
    >
      <MapContainer
        center={validCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <RecenterMap center={validCenter} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Manager Location Picker mode */}
        {onLocationSelect && (
          <>
            <LocationPicker onLocationSelect={onLocationSelect} />
            {pickerPosition && !isNaN(pickerPosition[0]) && !isNaN(pickerPosition[1]) && (
              <Marker
                position={pickerPosition}
                icon={customIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    onLocationSelect({
                      latitude: parseFloat(position.lat.toFixed(6)),
                      longitude: parseFloat(position.lng.toFixed(6)),
                    });
                  },
                }}
              >
                <Popup>Selected Hostel Location</Popup>
              </Marker>
            )}
          </>
        )}

        {/* Display Markers (e.g. for Student discovery / Hostel detail) */}
        {!onLocationSelect &&
          markers.map((m, index) => {
            if (!m.lat || !m.lng || isNaN(m.lat) || isNaN(m.lng)) return null;
            return (
              <Marker key={m.id || index} position={[m.lat, m.lng]} icon={customIcon}>
                <Popup>
                  <div className="p-1 max-w-[200px]">
                    <h4 className="font-bold text-slate-800 text-sm">{m.name}</h4>
                    {m.address && <p className="text-xs text-slate-500 mt-1">{m.address}</p>}
                    {m.city && <p className="text-xs font-medium text-violet-600">{m.city}</p>}
                    {m.rent && (
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        Starting ₹{m.rent}/mo
                      </p>
                    )}
                    {m.link && (
                      <Link
                        to={m.link}
                        className="mt-2 inline-block text-xs font-semibold text-violet-600 hover:underline"
                      >
                        View Details &rarr;
                      </Link>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default HostelMap;
