import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../utils/api';

// Center of the mock city (Mumbai/Pune area)
const LAT_CENTER = 18.975;
const LON_CENTER = 72.825;

interface MapProps {
  viewMode: 'traffic' | 'pollution' | 'hospitals' | 'emergency';
  alerts?: any[];
  feedback?: any[];
}

// Custom DivIcon creator for modern vector SVG markers
const createSvgIcon = (color: string, type: 'alert' | 'hospital' | 'complaint') => {
  let svgContent = '';
  
  if (type === 'hospital') {
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28" height="28">
        <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
      </svg>
    `;
  } else if (type === 'alert') {
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="30" height="30" class="animate-bounce">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    `;
  } else {
    // Citizen complaint
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
      </svg>
    `;
  }

  return L.divIcon({
    html: `<div style="display: flex; justify-content: center; align-items: center;">${svgContent}</div>`,
    className: 'custom-leaflet-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Component to dynamically fit map bounds when coordinates change
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Inner component that has access to the map instance for panning
const LocateControl: React.FC<{ userLocation: [number, number] | null }> = ({ userLocation }) => {
  const map = useMap();
  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        map.flyTo(coords, 15, { animate: true, duration: 1.5 });
      },
      () => alert('Location access denied. Please enable location permissions in your browser.')
    );
  };
  return (
    <div
      onClick={handleLocate}
      title="Go to my location"
      style={{
        position: 'absolute', bottom: '80px', right: '10px', zIndex: 1000,
        background: 'white', border: '2px solid rgba(0,0,0,0.2)', borderRadius: '4px',
        padding: '5px 8px', cursor: 'pointer', fontSize: '18px', boxShadow: '0 1px 5px rgba(0,0,0,0.3)',
        userSelect: 'none'
      }}
    >📍</div>
  );
};

export const LeafletMap: React.FC<MapProps> = ({ viewMode, alerts = [], feedback = [] }) => {
  const [streets, setStreets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch coordinates for routes from the backend api
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await api.getStreets();
        setStreets(data);
      } catch (e) {
        console.error("Failed to load map street coordinates", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  // Auto-detect user location on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationError(null);
      },
      () => setLocationError('Location access denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Mock hospitals dataset
  const hospitals = [
    { name: "City General Hospital", lat: 18.972, lon: 72.828, capacity: "82% occupied", type: "General" },
    { name: "Apex Trauma Center", lat: 19.002, lon: 72.831, capacity: "91% occupied", type: "Trauma" },
    { name: "St. Luke's Pediatric clinic", lat: 18.948, lon: 72.805, capacity: "48% occupied", type: "Clinic" },
    { name: "Municipal Health Station 4", lat: 18.961, lon: 72.862, capacity: "65% occupied", type: "Station" }
  ];

  // Helper to color congestion lines
  const getCongestionColor = (streetName: string) => {
    if (streetName === "East Express Highway") return "#EF4444"; // high red
    if (streetName === "Main Street") return "#F59E0B";        // moderate orange
    return "#10B981";                                           // low green
  };

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md relative">
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 z-50 flex items-center justify-center font-semibold text-sm">
          Loading city coordinates...
        </div>
      )}
      {locationError && (
        <div className="absolute top-2 left-2 z-50 bg-amber-50 border border-amber-300 text-amber-700 text-xs px-3 py-1.5 rounded-lg shadow">
          ⚠️ {locationError} — map centered on Mumbai
        </div>
      )}
      <MapContainer
        center={[LAT_CENTER, LON_CENTER]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <ChangeView center={[LAT_CENTER, LON_CENTER]} zoom={13} />
        {/* Map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* My Location Button */}
        <LocateControl userLocation={userLocation} />

        {/* User's Current Location - Blue Pulsing Dot */}
        {userLocation && (
          <>
            {/* Outer pulse ring */}
            <CircleMarker
              center={userLocation}
              radius={18}
              pathOptions={{ fillColor: '#3B82F6', color: '#3B82F6', fillOpacity: 0.15, weight: 1 }}
            />
            {/* Inner solid dot */}
            <CircleMarker
              center={userLocation}
              radius={8}
              pathOptions={{ fillColor: '#2563EB', color: '#ffffff', fillOpacity: 1, weight: 2 }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold text-blue-700">📍 You are here</p>
                  <p className="text-slate-500 mt-0.5">
                    {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* 1. Traffic Layer - render route polylines */}
        {viewMode === 'traffic' && streets.map((street, idx) => (
          <Polyline
            key={idx}
            positions={street.coords}
            pathOptions={{
              color: getCongestionColor(street.name),
              weight: 5,
              opacity: 0.8
            }}
          >
            <Popup>
              <div className="text-xs font-semibold p-1">
                <p className="font-bold text-slate-800">{street.name}</p>
                <p className="text-slate-500 mt-1">Zone: {street.zone}</p>
                <p className="mt-1">
                  Status: <span className="font-bold">{street.name === "East Express Highway" ? 'High Congestion' : street.name === "Main Street" ? 'Moderate Traffic' : 'Clear'}</span>
                </p>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* 2. Pollution Layer - render regional translucent circles */}
        {viewMode === 'pollution' && (
          <>
            {/* Zone 3 - Industrial East (Unhealthy) */}
            <CircleMarker
              center={[18.962, 72.868]}
              radius={80}
              pathOptions={{ fillColor: '#EF4444', color: '#EF4444', fillOpacity: 0.25, weight: 1.5 }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold text-slate-800">Zone 3 - Industrial East</p>
                  <p className="text-red-500 font-bold mt-1">AQI: 152 (Poor)</p>
                  <p className="text-slate-500 mt-0.5">Primary pollutant: PM2.5</p>
                </div>
              </Popup>
            </CircleMarker>
            
            {/* Zone 1 - Downtown Core (Moderate) */}
            <CircleMarker
              center={[18.978, 72.822]}
              radius={60}
              pathOptions={{ fillColor: '#F59E0B', color: '#F59E0B', fillOpacity: 0.2, weight: 1.5 }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold text-slate-800">Zone 1 - Downtown Core</p>
                  <p className="text-amber-500 font-bold mt-1">AQI: 84 (Moderate)</p>
                </div>
              </Popup>
            </CircleMarker>

            {/* Other zones (Good) */}
            <CircleMarker
              center={[18.950, 72.801]}
              radius={70}
              pathOptions={{ fillColor: '#10B981', color: '#10B981', fillOpacity: 0.15, weight: 1.5 }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold text-slate-800">Zone 4 - Western Suburbs</p>
                  <p className="text-green-500 font-bold mt-1">AQI: 38 (Good)</p>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* 3. Hospitals Layer */}
        {viewMode === 'hospitals' && hospitals.map((hosp, idx) => (
          <Marker
            key={idx}
            position={[hosp.lat, hosp.lon]}
            icon={createSvgIcon('#3B82F6', 'hospital')}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-slate-800">{hosp.name}</p>
                <p className="text-slate-500 mt-1">Type: {hosp.type}</p>
                <p className="font-semibold text-blue-600 mt-0.5">Capacity: {hosp.capacity}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 4. Emergency Alerts Layer */}
        {viewMode === 'emergency' && alerts.map((alert) => {
          // coordinate lookup based on zone
          const zoneCoordinates: Record<string, [number, number]> = {
            "Zone 1": [18.978, 72.822],
            "Zone 2": [19.012, 72.835],
            "Zone 3": [18.962, 72.868],
            "Zone 4": [18.950, 72.801],
            "Zone 5": [18.932, 72.830]
          };
          const coords = zoneCoordinates[alert.zone] || [LAT_CENTER, LON_CENTER];
          return (
            <Marker
              key={alert.id}
              position={coords}
              icon={createSvgIcon(alert.severity === 'Critical' ? '#EF4444' : '#F59E0B', 'alert')}
            >
              <Popup>
                <div className="text-xs p-1 w-48">
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white ${alert.severity === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`}>
                    {alert.severity}
                  </span>
                  <p className="font-bold text-slate-800 mt-1.5">{alert.title}</p>
                  <p className="text-slate-500 mt-1 text-[10px] leading-relaxed">{alert.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 5. Draw Citizen Complaints (always visible but small pins for high detail) */}
        {feedback.map((complaint) => (
          <Marker
            key={complaint.id}
            position={[complaint.lat, complaint.lon]}
            icon={createSvgIcon(
              complaint.priority === 'High' ? '#EF4444' : complaint.priority === 'Medium' ? '#F59E0B' : '#10B981',
              'complaint'
            )}
          >
            <Popup>
              <div className="text-xs p-1 w-44">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400">#{complaint.id}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[8px] font-bold text-white ${
                    complaint.status === 'Resolved' ? 'bg-green-500' : complaint.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="font-bold text-slate-800 mt-1.5 truncate">{complaint.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed truncate">{complaint.description}</p>
                <p className="text-[9px] text-slate-400 mt-1">Sentiment: <b>{complaint.sentiment}</b></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
