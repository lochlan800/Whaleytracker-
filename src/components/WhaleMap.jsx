import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function makePopupHtml(whale) {
  const photo = whale.photo
    ? `<img src="${esc(whale.photo)}" alt="${esc(whale.commonName)}"
         onerror="this.style.display='none'"
         style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px;display:block" />`
    : '';
  const row = (label, val) => val
    ? `<tr>
         <td style="color:#94a3b8;padding-right:8px;padding-bottom:3px;white-space:nowrap;vertical-align:top">${esc(label)}</td>
         <td style="color:#334155;padding-bottom:3px">${esc(val)}</td>
       </tr>`
    : '';
  const link = whale.gbifUrl
    ? `<a href="${esc(whale.gbifUrl)}" target="_blank" rel="noopener noreferrer"
         style="display:block;margin-top:10px;text-align:center;font-size:12px;color:#38bdf8;text-decoration:none">
         View on GBIF →
       </a>`
    : '';

  return `
    <div style="min-width:200px;max-width:260px;font-family:system-ui,sans-serif">
      ${photo}
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="width:12px;height:12px;border-radius:50%;background:${esc(whale.color)};flex-shrink:0;box-shadow:0 0 6px ${esc(whale.color)}"></span>
        <strong style="font-size:15px;color:#1e293b;line-height:1.2">${esc(whale.commonName)}</strong>
      </div>
      <div style="font-size:12px;color:#475569;font-style:italic;margin-bottom:8px">${esc(whale.species)}</div>
      <table style="font-size:13px;width:100%;border-collapse:collapse">
        ${row('Date', whale.date)}
        ${row('Location', whale.location || whale.country)}
        ${row('Source', whale.source)}
        ${row('Lat / Lng', `${whale.lat.toFixed(3)}, ${whale.lng.toFixed(3)}`)}
      </table>
      ${link}
    </div>`;
}

function makeWhaleIcon(color) {
  const size = 14;
  const total = size * 2 + 8;
  const cx = size + 4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}">
    <circle cx="${cx}" cy="${cx}" r="${size}" fill="${color}" fill-opacity="0.25"/>
    <circle cx="${cx}" cy="${cx}" r="${size * 0.55}" fill="${color}" stroke="white" stroke-width="1.5"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [total, total],
    iconAnchor: [cx, cx],
    popupAnchor: [0, -cx],
  });
}

function MarkersLayer({ whales, activeSpecies }) {
  const map = useMap();
  const markersRef = useRef([]);

  useEffect(() => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const visible = activeSpecies.size === 0
      ? whales
      : whales.filter(w => activeSpecies.has(w.species));

    visible.forEach(whale => {
      const marker = L.marker([whale.lat, whale.lng], { icon: makeWhaleIcon(whale.color) });
      marker.bindPopup(makePopupHtml(whale), { maxWidth: 280, className: 'whale-popup' });
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    return () => { markersRef.current.forEach(m => m.remove()); };
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
