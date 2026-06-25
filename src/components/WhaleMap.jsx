import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import WhalePopup from './WhalePopup';
import { createRoot } from 'react-dom/client';

// Fix default icon path issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeWhaleIcon(color, isNew = false) {
  const size = isNew ? 18 : 14;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size * 2 + 8}" height="${size * 2 + 8}" viewBox="0 0 ${size * 2 + 8} ${size * 2 + 8}">
      <circle cx="${size + 4}" cy="${size + 4}" r="${size}" fill="${color}" fill-opacity="0.25" />
      <circle cx="${size + 4}" cy="${size + 4}" r="${size * 0.55}" fill="${color}" stroke="white" stroke-width="1.5" />
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size * 2 + 8, size * 2 + 8],
    iconAnchor: [size + 4, size + 4],
    popupAnchor: [0, -(size + 4)],
  });
}

function MarkersLayer({ whales, activeSpecies }) {
  const map = useMap();
  const markersRef = useRef([]);
  const popupRootsRef = useRef([]);

  useEffect(() => {
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    popupRootsRef.current.forEach(r => { try { r.unmount(); } catch {} });
    markersRef.current = [];
    popupRootsRef.current = [];

    const visible = activeSpecies.size === 0
      ? whales
      : whales.filter(w => activeSpecies.has(w.species));

    visible.forEach(whale => {
      const icon = makeWhaleIcon(whale.color);
      const marker = L.marker([whale.lat, whale.lng], { icon });

      const popupEl = document.createElement('div');
      const root = createRoot(popupEl);
      root.render(<WhalePopup whale={whale} />);
      popupRootsRef.current.push(root);

      marker.bindPopup(popupEl, { maxWidth: 280, className: 'whale-popup' });
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      popupRootsRef.current.forEach(r => { try { r.unmount(); } catch {} });
    };
  }, [map, whales, activeSpecies]);

  return null;
}

export default function WhaleMap({ whales, activeSpecies }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={3}
      minZoom={2}
      maxZoom={18}
      style={{ width: '100%', height: '100%', background: '#0a1628' }}
      worldCopyJump
    >
      {/* ESRI World Imagery — free satellite tiles, no API key */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
        maxZoom={19}
      />
      {/* Labels overlay */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        attribution=""
        opacity={0.6}
        maxZoom={19}
      />
      <MarkersLayer whales={whales} activeSpecies={activeSpecies} />
    </MapContainer>
  );
}
