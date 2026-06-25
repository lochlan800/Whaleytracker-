# WhaleyTracker

Live cetacean sighting tracker with a satellite world map.

## Features

- Satellite imagery map (ESRI World Imagery, no API key needed)
- Live whale sighting data from the [GBIF public API](https://www.gbif.org/)
- 8 tracked species: Humpback, Blue Whale, Orca, Sperm, Gray, Fin, Minke, Right Whale
- Color-coded markers — click any to see species, date, location, and source
- Species filter sidebar with live sighting counts
- Auto-refreshes every 5 minutes; falls back to sample data if API is unreachable

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
