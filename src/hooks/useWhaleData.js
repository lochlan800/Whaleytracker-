import { useState, useEffect, useCallback } from 'react';

const GBIF_URL = 'https://api.gbif.org/v1/occurrence/search';

export const SPECIES_CONFIG = [
  { scientific: 'Megaptera novaeangliae',  common: 'Humpback Whale',              color: '#FF6B35', taxonKey: 2440718 },
  { scientific: 'Balaenoptera musculus',   common: 'Blue Whale',                  color: '#38BDF8', taxonKey: 2440728 },
  { scientific: 'Orcinus orca',            common: 'Orca',                        color: '#E2E8F0', taxonKey: 2440706 },
  { scientific: 'Physeter macrocephalus',  common: 'Sperm Whale',                 color: '#A78BFA', taxonKey: 2440451 },
  { scientific: 'Eschrichtius robustus',   common: 'Gray Whale',                  color: '#94A3B8', taxonKey: 2440773 },
  { scientific: 'Balaenoptera physalus',   common: 'Fin Whale',                   color: '#4ADE80', taxonKey: 2440730 },
  { scientific: 'Balaenoptera acutorostrata', common: 'Minke Whale',              color: '#34D399', taxonKey: 2440722 },
  { scientific: 'Eubalaena glacialis',     common: 'North Atlantic Right Whale',  color: '#F87171', taxonKey: 2440691 },
  { scientific: 'Eubalaena australis',     common: 'Southern Right Whale',        color: '#FB923C', taxonKey: null   },
  { scientific: 'Balaenoptera borealis',   common: 'Sei Whale',                   color: '#FACC15', taxonKey: null   },
];

const SPECIES_MAP = Object.fromEntries(
  SPECIES_CONFIG.map(s => [s.scientific, s])
);

function classifyOccurrence(occ) {
  const sci = occ.species || occ.scientificName?.split(' ').slice(0, 2).join(' ') || '';
  const known = SPECIES_MAP[sci];
  return {
    id: occ.key,
    lat: occ.decimalLatitude,
    lng: occ.decimalLongitude,
    species: sci,
    commonName: known?.common ?? (occ.vernacularName || sci || 'Unknown Cetacean'),
    color: known?.color ?? '#60A5FA',
    date: occ.eventDate ? occ.eventDate.slice(0, 10) : 'Unknown',
    country: occ.country || '',
    location: occ.locality || occ.stateProvince || occ.country || 'Open Ocean',
    source: occ.datasetName || 'GBIF',
    photo: occ.media?.[0]?.identifier ?? null,
    gbifUrl: `https://www.gbif.org/occurrence/${occ.key}`,
  };
}

// Fallback sample data spread across global oceans so the map always has points
const FALLBACK_DATA = [
  { lat: 21.4,  lng: -157.9, species: 'Megaptera novaeangliae',  date: '2025-02-10', location: 'Hawaii, USA',        country: 'United States' },
  { lat: -33.9, lng: 18.4,   species: 'Eubalaena australis',     date: '2025-07-05', location: 'Cape Town, South Africa', country: 'South Africa' },
  { lat: 58.3,  lng: -5.4,   species: 'Balaenoptera physalus',   date: '2025-04-12', location: 'Hebrides, Scotland',  country: 'United Kingdom' },
  { lat: -54.2, lng: -36.5,  species: 'Balaenoptera musculus',   date: '2025-01-22', location: 'South Georgia',       country: 'South Georgia' },
  { lat: 70.1,  lng: -20.3,  species: 'Balaenoptera acutorostrata', date: '2025-06-01', location: 'Iceland',          country: 'Iceland' },
  { lat: 37.8,  lng: -122.5, species: 'Orcinus orca',            date: '2025-05-18', location: 'Monterey Bay, USA',  country: 'United States' },
  { lat: 15.6,  lng: 55.4,   species: 'Physeter macrocephalus',  date: '2025-03-07', location: 'Gulf of Oman',        country: 'Oman' },
  { lat: -12.5, lng: 130.8,  species: 'Megaptera novaeangliae',  date: '2025-08-20', location: 'Kimberley, Australia', country: 'Australia' },
  { lat: 44.5,  lng: -63.6,  species: 'Eubalaena glacialis',     date: '2025-04-30', location: 'Nova Scotia, Canada', country: 'Canada' },
  { lat: -41.3, lng: -174.0, species: 'Balaenoptera musculus',   date: '2025-02-14', location: 'New Zealand',         country: 'New Zealand' },
  { lat: 27.0,  lng: -25.0,  species: 'Balaenoptera physalus',   date: '2025-05-09', location: 'Mid-Atlantic',        country: '' },
  { lat: 63.4,  lng: -20.3,  species: 'Megaptera novaeangliae',  date: '2025-07-11', location: 'Iceland',             country: 'Iceland' },
  { lat: -55.0, lng: -67.0,  species: 'Balaenoptera musculus',   date: '2025-01-05', location: 'Strait of Magellan',  country: 'Chile' },
  { lat: 48.5,  lng: -123.3, species: 'Orcinus orca',            date: '2025-06-25', location: 'Salish Sea, Canada',  country: 'Canada' },
  { lat: 10.5,  lng: 44.5,   species: 'Physeter macrocephalus',  date: '2025-03-19', location: 'Red Sea',             country: 'Yemen' },
].map((d, i) => {
  const known = SPECIES_MAP[d.species];
  return {
    id: `fallback-${i}`,
    lat: d.lat, lng: d.lng,
    species: d.species,
    commonName: known?.common ?? 'Unknown Cetacean',
    color: known?.color ?? '#60A5FA',
    date: d.date,
    country: d.country,
    location: d.location,
    source: 'Sample Data',
    photo: null,
    gbifUrl: null,
  };
});

export function useWhaleData() {
  const [whales, setWhales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentYear = new Date().getFullYear();

      // Query each whale species separately so markers are color-coded and we
      // can restrict to recent at-sea *observations* (not museum specimens or
      // strandings, which geolocate onto land and caused inland clustering).
      const requests = SPECIES_CONFIG.map(async (sp) => {
        const params = new URLSearchParams({
          scientificName: sp.scientific,
          hasCoordinate: 'true',
          hasGeospatialIssue: 'false',
          occurrenceStatus: 'PRESENT',
          year: `${currentYear - 10},${currentYear}`,
          limit: '40',
        });
        // basisOfRecord repeats: keep human/machine observations, drop specimens
        params.append('basisOfRecord', 'HUMAN_OBSERVATION');
        params.append('basisOfRecord', 'MACHINE_OBSERVATION');

        const res = await fetch(`${GBIF_URL}?${params}`);
        if (!res.ok) throw new Error(`GBIF API error: ${res.status}`);
        const json = await res.json();
        return (json.results || [])
          .filter(o => o.decimalLatitude != null && o.decimalLongitude != null)
          .map(classifyOccurrence);
      });

      const settled = await Promise.allSettled(requests);
      const merged = [];
      const seen = new Set();
      for (const r of settled) {
        if (r.status !== 'fulfilled') continue;
        for (const w of r.value) {
          if (seen.has(w.id)) continue;
          seen.add(w.id);
          merged.push(w);
        }
      }

      if (merged.length === 0) throw new Error('No results returned');
      setWhales(merged);
      setUsingFallback(false);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('GBIF fetch failed, using fallback data:', err.message);
      setWhales(FALLBACK_DATA);
      setUsingFallback(true);
      setLastUpdated(new Date());
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchData]);

  return { whales, loading, error, lastUpdated, usingFallback, refresh: fetchData };
}
