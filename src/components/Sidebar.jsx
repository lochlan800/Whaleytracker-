import { SPECIES_CONFIG } from '../hooks/useWhaleData';

export default function Sidebar({ whales, activeSpecies, onToggleSpecies, onSelectAll, onClearAll, loading, lastUpdated, usingFallback, onRefresh }) {
  const speciesCounts = {};
  whales.forEach(w => {
    speciesCounts[w.species] = (speciesCounts[w.species] || 0) + 1;
  });

  const presentSpecies = SPECIES_CONFIG.filter(s => speciesCounts[s.scientific] > 0);
  const otherCount = whales.filter(w => !SPECIES_CONFIG.find(s => s.scientific === w.species)).length;

  const visibleCount = whales.filter(w =>
    activeSpecies.size === 0 || activeSpecies.has(w.species)
  ).length;

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🐋</span>
          <div>
            <h1>WhaleyTracker</h1>
            <p className="tagline">Live Cetacean Sightings</p>
          </div>
        </div>
        <div className="status-badge">
          <span className={`status-dot ${loading ? 'loading' : 'live'}`} />
          <span>{loading ? 'Fetching…' : usingFallback ? 'Sample Data' : 'GBIF Live'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat">
          <span className="stat-number">{visibleCount}</span>
          <span className="stat-label">Sightings</span>
        </div>
        <div className="stat">
          <span className="stat-number">{presentSpecies.length + (otherCount > 0 ? 1 : 0)}</span>
          <span className="stat-label">Species</span>
        </div>
        <div className="stat">
          <span className="stat-number">{timeStr}</span>
          <span className="stat-label">Updated</span>
        </div>
      </div>

      {usingFallback && (
        <div className="fallback-notice">
          Live API unavailable — showing sample global data.
        </div>
      )}

      {/* Filter Controls */}
      <div className="section-header">
        <span>Filter by Species</span>
        <div className="filter-actions">
          <button className="text-btn" onClick={onSelectAll}>All</button>
          <span className="divider">·</span>
          <button className="text-btn" onClick={onClearAll}>None</button>
        </div>
      </div>

      {/* Species List */}
      <div className="species-list">
        {loading && whales.length === 0 ? (
          <div className="loading-list">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton-row" />)}
          </div>
        ) : (
          <>
            {presentSpecies.map(s => {
              const count = speciesCounts[s.scientific] || 0;
              const active = activeSpecies.size === 0 || activeSpecies.has(s.scientific);
              return (
                <button
                  key={s.scientific}
                  className={`species-row ${active ? 'active' : 'inactive'}`}
                  onClick={() => onToggleSpecies(s.scientific)}
                >
                  <span className="species-dot" style={{ background: s.color, boxShadow: active ? `0 0 8px ${s.color}80` : 'none' }} />
                  <span className="species-name">{s.common}</span>
                  <span className="species-count">{count}</span>
                </button>
              );
            })}
            {otherCount > 0 && (
              <button
                className={`species-row ${activeSpecies.size === 0 || activeSpecies.has('__other__') ? 'active' : 'inactive'}`}
                onClick={() => onToggleSpecies('__other__')}
              >
                <span className="species-dot" style={{ background: '#60A5FA' }} />
                <span className="species-name">Other Cetaceans</span>
                <span className="species-count">{otherCount}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Refresh */}
      <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
        <span className={loading ? 'spin' : ''}>↻</span>
        {loading ? 'Refreshing…' : 'Refresh Data'}
      </button>

      {/* Footer */}
      <div className="sidebar-footer">
        Data from <a href="https://www.gbif.org" target="_blank" rel="noopener noreferrer">GBIF</a> · Cetacea order
      </div>
    </div>
  );
}
