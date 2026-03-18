# ⚡ Flash-Flood Database — Japan

> Interactive visualization of 20 years of flash flood events across 1,922 hydrological stations in Japan.
>
> **Kinouchi Laboratory · 2002 – 2023**

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-blue?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Leaflet-199900?logo=leaflet&logoColor=white" alt="Leaflet" />
</p>

---

## Features

- **🗺️ Interactive Map** — Leaflet map with 1,922 station markers, dynamic zoom scaling, color-coded selection states, and basin grouping
- **📊 Analytics Panel** — Tabbed side panel with event metrics, date range filtering, and three SVG chart presets (timeline, monthly frequency, peak distribution)
- **🔍 Instant Search** — Client-side search index with prefix matching across basins and station names
- **📥 Data Export** — XLSX export via ExcelJS and retina PNG chart export (SVG → Canvas → PNG)
- **🖥️ CRT Aesthetic** — Retro monitor shell with phosphor glow, glass reflections, and physical-style buttons
- **📖 Documentation** — Multi-panel docs covering research background, data pipeline, algorithm, and validation

---

## Tech Stack

| | Technology |
|---|---|
| Framework | Next.js 16 · App Router · React 19 |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL via Drizzle ORM |
| Styling | Tailwind CSS 4 + CSS Modules |
| Map | Leaflet + react-leaflet |
| Data Fetching | SWR |
| Export | ExcelJS · SVG→PNG pipeline |

---

## Architecture

```
UI Layer          Leaflet Map · Side Panel · SVG Charts · CRT Shell
                          ↕
State Layer       useMapState · useStationEvents · useStationSearch · useCsvExport
                          ↕
API Layer         /api/stations · /api/stations/:id/events · /api/basins/:name/events
                          ↕
Data Layer        PostgreSQL (stations + station_records) via Drizzle ORM
```

**Key decisions:** client-side station preloading for instant search · two-phase event fetching (summary first, chart data on demand) · per-tab state isolation · hand-rolled SVG charts for minimal bundle · SSR disabled for Leaflet

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm
- PostgreSQL database with the flash flood dataset

### Setup

```bash
git clone https://github.com/FridayNight2000/FlashFlood-database-demo.git
cd FlashFlood-database-demo/web
pnpm install
```

Create `.env.local`:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
```

### Run

```bash
pnpm dev        # Development server → http://localhost:3000
pnpm build      # Production build
pnpm start      # Production server
pnpm lint       # ESLint
```

---

## Project Structure

```
app/
├── page.tsx                    # Password-gated landing page
├── map/                        # Core map page + components
│   ├── LeafletMap.tsx          #   Map orchestration
│   └── components/             #   Markers, search bar, side panel, charts
├── document/                   # Documentation pages (route groups)
└── api/                        # REST endpoints (stations, events, basins)

hooks/                          # useMapState, useStationEvents, useStationSearch, useCsvExport
lib/                            # DB connection, Drizzle schema, query functions
components/ui/crt/              # CRT monitor shell wrapper
types/                          # Shared TypeScript definitions
```

---

## License

Developed for the **Kinouchi Laboratory** research initiative.
