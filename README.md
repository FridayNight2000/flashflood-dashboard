# Flash-Flood Database Web

Interactive web app for exploring Japan-wide flash flood events, documenting the extraction methodology, and preparing hydrological time-series data before event detection.

Kinouchi Laboratory, 2002-2023 dataset.

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-blue?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

## What It Includes

- `/database`: interactive station and basin explorer backed by PostgreSQL
- `/prep`: browser-based wizard for file scanning, cleaning, and detrending hydrological records
- `/doc`: research-facing documentation for introduction, pipeline, extraction logic, and validation
- `/`: password-gated landing page for the internal demo entry

## Core Capabilities

- Station-level and basin-level flash flood event browsing
- Searchable database UI with charts, map interactions, and export support
- Four-step preprocessing flow: upload, inspect, clean, detrend
- Event extraction documentation covering baseline correction, peak detection, and boundary assignment
- Validation notes comparing extracted events against official historical records

## Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4, CSS Modules |
| Data | PostgreSQL, Drizzle ORM, postgres |
| Maps | Leaflet, react-leaflet |
| Charts / Docs | Recharts, react-katex, react-syntax-highlighter |
| Utilities | SWR, ExcelJS, lucide-react |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page with password form |
| `/database` | Main flash-flood database interface |
| `/prep` | Hydrological data prep wizard |
| `/doc/introduction` | Project overview and research motivation |
| `/doc/data-pipeline` | Pipeline description |
| `/doc/event-extraction` | Extraction logic and thresholds |
| `/doc/validation` | Validation method and results |
| `/doc/developer-guide` | Developer notes, currently in progress |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL with the flash-flood dataset loaded

### Install

```bash
git clone https://github.com/FridayNight2000/FlashFlood-database-demo.git
cd FlashFlood-database-demo/web
pnpm install
```

### Environment

Create `.env.local`:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
```

`DATABASE_URL` is required at runtime for the database pages and API routes.

### Development

```bash
pnpm dev
```

App runs at `http://localhost:3000`.

### Other Commands

```bash
pnpm build
pnpm start
pnpm lint
```

## Project Structure

```text
app/
├── page.tsx                     # Landing page
├── database/                    # Database map and explorer UI
├── prep/                        # Hydrological preprocessing workflow
├── doc/                         # Documentation pages
└── api/                         # Stations and basin endpoints

components/
├── hydro/                       # Prep wizard UI
└── ui/crt/                      # CRT shell and layout components

lib/
├── hydro/                       # Parsing, cleaning, detrending, export
├── queries/                     # Database query layer
├── schema/                      # Drizzle schema
└── db.ts                        # PostgreSQL connection
```

## Notes

- The README reflects the current route layout in this `web` app.
- The developer guide page exists but is not finished yet.
- Leaflet UI is isolated to client-side code where needed.

## License

Developed for the Kinouchi Laboratory research project.
