export default function WhalePopup({ whale }) {
  return (
    <div style={{ minWidth: 200, maxWidth: 260, fontFamily: 'system-ui, sans-serif' }}>
      {whale.photo && (
        <img
          src={whale.photo}
          alt={whale.commonName}
          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span
          style={{
            width: 12, height: 12, borderRadius: '50%',
            background: whale.color, flexShrink: 0,
            boxShadow: `0 0 6px ${whale.color}`,
          }}
        />
        <strong style={{ fontSize: 15, color: '#1e293b', lineHeight: 1.2 }}>
          {whale.commonName}
        </strong>
      </div>
      <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', marginBottom: 8 }}>
        {whale.species}
      </div>
      <table style={{ fontSize: 13, width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <PopupRow label="Date" value={whale.date} />
          <PopupRow label="Location" value={whale.location || whale.country || 'Open Ocean'} />
          <PopupRow label="Source" value={whale.source} />
          <PopupRow label="Lat / Lng" value={`${whale.lat.toFixed(3)}, ${whale.lng.toFixed(3)}`} />
        </tbody>
      </table>
      {whale.gbifUrl && (
        <a
          href={whale.gbifUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', marginTop: 10, textAlign: 'center',
            fontSize: 12, color: '#38bdf8',
            textDecoration: 'none', padding: '4px 0',
          }}
        >
          View on GBIF →
        </a>
      )}
    </div>
  );
}

function PopupRow({ label, value }) {
  if (!value) return null;
  return (
    <tr>
      <td style={{ color: '#94a3b8', paddingRight: 8, paddingBottom: 3, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
        {label}
      </td>
      <td style={{ color: '#334155', paddingBottom: 3 }}>{value}</td>
    </tr>
  );
}
