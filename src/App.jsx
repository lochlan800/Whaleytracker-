import { useState, useCallback } from 'react';
import WhaleMap from './components/WhaleMap';
import Sidebar from './components/Sidebar';
import { useWhaleData } from './hooks/useWhaleData';
import './App.css';

function App() {
  const { whales, loading, error, lastUpdated, usingFallback, refresh } = useWhaleData();
  const [activeSpecies, setActiveSpecies] = useState(new Set()); // empty = all visible

  const handleToggle = useCallback((sci) => {
    setActiveSpecies(prev => {
      if (prev.size === 0) {
        const allSpecies = new Set(whales.map(w => w.species));
        allSpecies.delete(sci);
        return allSpecies;
      }
      const next = new Set(prev);
      if (next.has(sci)) {
        next.delete(sci);
        if (next.size === 0) return new Set();
      } else {
        next.add(sci);
        const allSpecies = new Set(whales.map(w => w.species));
        if ([...allSpecies].every(s => next.has(s))) return new Set();
      }
      return next;
    });
  }, [whales]);

  const handleSelectAll = useCallback(() => setActiveSpecies(new Set()), []);
  const handleClearAll = useCallback(() => setActiveSpecies(new Set(['__none__'])), []);

  return (
    <div className="app">
      <Sidebar
        whales={whales}
        activeSpecies={activeSpecies}
        onToggleSpecies={handleToggle}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        loading={loading}
        lastUpdated={lastUpdated}
        usingFallback={usingFallback}
        onRefresh={refresh}
      />
      <div className="map-container">
        <WhaleMap whales={whales} activeSpecies={activeSpecies} />
        {loading && whales.length === 0 && (
          <div className="map-loading-overlay">
            <div className="map-loading-inner">
              <span className="loader-whale">🐋</span>
              <p>Loading whale sightings…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
