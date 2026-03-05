# Working with PRD
- when working on a task in a PRD file at the end after testing always mark the task and sub task as done.
## Project Overview

Schumann Resonance Live Monitor — a real-time web dashboard that ingests SR spectrogram data from public monitoring stations (Tomsk, HeartMath GCI), enriches it with NASA/NOAA space weather data, and presents it through an immersive "Dark Cosmos" themed Next.js dashboard. The app serves two audiences: researchers (precision) and explorers (intuition), with neutral, non-editorialized data presentation.

**Current state:** Pre-code. PRD documents exist in `docs/`. Implementation follows 3 phases.

## Architecture

**Monorepo layout** (Next.js + Supabase Edge Functions in one repo):
```
src/app/(dashboard)/     → Main dashboard (App Router)
src/app/api/             → Next.js API routes (export endpoints)
src/components/charts/   → ECharts wrappers (spectrogram, sparkline, scatter, overlay)
src/components/particles/→ Canvas 2D particle system
src/lib/                 → Supabase client, Zustand store, types, constants, queries
supabase/functions/      → Deno Edge Functions (one folder per scraper)
supabase/migrations/     → SQL migration files
docs/                    → PRD files (phase-1, phase-2, phase-3)
```

**Data flow:** pg_cron → Edge Functions (scrape/poll) → Supabase DB → Supabase Realtime → Zustand store → React components

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui (New York style, Zinc base)
- **Charts:** Apache ECharts via `echarts-for-react` with custom `darkCosmos` theme
- **State:** Zustand (global store + Supabase Realtime subscription)
- **Data fetching:** @tanstack/react-query for initial load, Supabase Realtime for live updates
- **Layout:** react-resizable-panels (4-zone grid)
- **Backend:** Supabase (PostgreSQL + TimescaleDB), Supabase Storage
- **Edge Functions:** Deno runtime, `imagescript` for image pixel extraction
- **Package manager:** npm

## Commands

```bash
npm run dev              # Start Next.js dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
supabase functions deploy <name>   # Deploy single Edge Function
supabase functions invoke <name>   # Test Edge Function manually
supabase db push         # Apply migrations to remote database
```

## Database Schema

4 tables + 1 materialized view on Supabase (PostgreSQL + TimescaleDB):

- `sr_readings` — Time-series SR data. Hypertable. PK: (time, source_id, mode_number). mode_number 1-6 for harmonics, 0 for total power.
- `space_weather` — NOAA/OMNI geomagnetic indices. Hypertable. PK: time. Columns: kp_index, dst_index, bz_component, solar_wind_speed, proton_density, ae_index, f10_index, flare_class.
- `sr_spectrograms` — Metadata for raw images stored in `sr-spectrograms-raw` bucket.
- `source_health` — Scraper health logging. Status values: ok, error, degraded, offline, parse_error, rate_limited.
- `sr_hourly_agg` — Materialized view, refreshed hourly via pg_cron. Used for historical queries >24h.

RLS: anon can SELECT all tables. service_role can do everything.

## Edge Functions (Deno)

| Function | Schedule | Source |
|----------|----------|--------|
| poll-noaa-swpc | */5 min | 7 SWPC JSON endpoints → space_weather |
| scrape-tomsk | */15 min | sosrff.tsu.ru images → sr_readings + storage |
| scrape-heartmath | hourly | nocc.heartmath.org spectrograms → sr_readings + storage |
| scrape-heartmath-power | hourly +5min | HeartMath XHR → sr_readings (mode_number=0) |
| backfill-omni | daily 3AM | CDAWeb HAPI → space_weather (historical) |

All Edge Functions: log to `source_health`, don't retry on failure (next cron handles it), use `Deno.env.get()` for secrets.

## Critical Constraints

- **Supabase Postgres version must be 15 or 16** (NOT 17 — TimescaleDB deprecated on 17)
- **Supabase Free tier:** 500K Edge Function invocations/month (we use ~2.6%), 500MB DB
- **NOAA SWPC format change:** March 31, 2026 deadline — parse defensively
- **Tomsk timezone:** Krasnoyarsk Time (UTC+7, no DST since 2014)
- **Data retention policy:** Raw images 90 days, numerical data forever
- **HeartMath power endpoint:** Requires manual XHR discovery via Chrome DevTools
- **Image processing:** Use `imagescript` (TS + WASM) in Deno Edge Functions — no native bindings
- **Data neutrality:** No editorializing about SR meanings. Physical units only (pT, Hz, pT²/Hz). Template-based summaries, never AI-generated interpretive text.

## Secrets & Environment Variables

- All `.env*` files are denied in Claude Code permissions (`.claude/settings.local.json`) — never read, write, or edit them.
- See `env.example` for required key names (no dot prefix — kept outside the `.env*` deny glob so Claude can read it).
- Never hardcode secrets; always use environment variables (`process.env` in Next.js, `Deno.env.get()` in Edge Functions).

## Design System: Dark Cosmos

- Background: #0D1117, Elevated: #161B22, Surface: #21262D
- Accents: Blue #58A6FF, Green #3FB950, Gold #E3B341, Red #F85149, Purple #BC8CFF
- Fonts: Plus Jakarta Sans (body), JetBrains Mono (data values, chart labels)
- All charts use registered `darkCosmos` ECharts theme
- Particle system reads from Zustand store via `subscribe()` (not React hooks) to avoid re-renders

## SR Mode Frequencies

Mode 1: 7.83 Hz, Mode 2: 14.3 Hz, Mode 3: 20.8 Hz, Mode 4: 27.3 Hz, Mode 5: 33.8 Hz, Mode 6: 39.0 Hz

## Station IDs

`tomsk`, `heartmath_gci001` (California), `heartmath_gci002` (Saudi Arabia), `heartmath_gci003` (Lithuania), `heartmath_gci004` (Alberta), `heartmath_gci005` (New Zealand), `heartmath_gci006` (South Africa), `cumiana` (Italy, Phase 5+)

## Error Handling Pattern (All Scrapers)

- HTTP error/timeout: log to source_health, skip, let next cron retry
- 3 consecutive failures: status = 'degraded'
- 24h continuous failure: status = 'offline'
- Parse error: store raw image anyway, log 'parse_error', skip sr_readings insert
- NOAA 429: log 'rate_limited', back off
