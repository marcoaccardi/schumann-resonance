# SCHUMANN RESONANCE LIVE MONITOR

**Application Blueprint v4.2 — Experience-First Architecture**
Next.js + Supabase + Apache ECharts + Three.js + Tone.js

*A research-grade, immersive Schumann Resonance monitoring platform
serving scientists and seekers through one unified experience*

**March 2026 — Verified, Error-Corrected & Implementation-Ready**
Optimized for AI-assisted development (Cursor / Claude Code)

---

## 1. Executive Summary

This document is a complete architectural blueprint for building an immersive web application that ingests live Schumann Resonance (SR) data from multiple public sources, stores it in Supabase (PostgreSQL with TimescaleDB), and presents it through an experience-first Next.js dashboard that serves two audiences simultaneously: researchers seeking precision and explorers seeking intuition.

The application aggregates already-processed SR spectrogram and parameter data from established monitoring stations, enriches it with NASA/NOAA space weather data, and presents it through a dark, cosmic visual language with animated spectrograms, 3D globe visualization, sonification, and particle-flow animations — all while maintaining research-grade data accuracy underneath.

The data is presented neutrally and accurately. The app does not editorialize about what SR patterns mean. It provides the tools to explore, and lets every user — whether geophysicist, biophysics researcher, or consciousness explorer — pursue their own line of inquiry with honest, well-labeled data.

### 1.1 What Changed in v4.0

- **HeartMath data architecture rewritten:** Discovered the actual backend at nocc.heartmath.org. Spectrogram calendar is plain server-rendered PHP (no JavaScript), trivially scrapable. Power chart uses Highcharts with XHR data endpoint. All Puppeteer/browserless.io references removed.
- **Charting library unified:** Recharts + D3.js replaced with Apache ECharts. One library handles heatmaps, line charts, scatter plots, correlation matrices. WebGL rendering for large datasets. Declarative JSON API is ideal for AI-assisted development.
- **Visual identity defined:** Dark/cosmic design system with aurora-like glows, animated spectrograms, and particle effects. Not a toggle between simple/advanced — a single design that serves both audiences.
- **Three new experience layers:** 3D globe with live data ribbons (Three.js / react-three-fiber), sonification engine (Tone.js), and animated particle flow tied to resonance intensity.
- **AI-assisted development path:** Every technology choice evaluated for compatibility with Cursor and Claude Code. Declarative over imperative. JSON config over manual DOM manipulation.

### 1.2 What Changed in v4.1 (Error Corrections)

- Sonification carrier frequency standardized to 220 Hz (A3) throughout. Removed conflicting 120 Hz reference.
- HeartMath total power now uses mode_number = 0 convention in sr_readings schema. Per-mode data (modes 1–6) comes from spectrogram pixel extraction only.
- 6th SR mode (~39 Hz) added to spectrogram extraction pipeline. Previously listed 5 modes only.
- State management standardized on Zustand throughout. Removed conflicting Jotai reference.
- source_health table added to public RLS policy. Required for the Status Zone dashboard panel.
- Station coordinates added as reference table and TypeScript constant. Required for 3D globe implementation.
- Image processing library specified: imagescript (pure TS, Deno-native) for JPEG/PNG pixel extraction in Edge Functions.
- Highcharts claim softened: XHR is the likely pattern for this dynamic chart, not an architectural invariant.
- ECharts Dark Cosmos theme configuration added as copy-paste-ready code block.

### 1.3 What Changed in v4.2 (Audit + Science Verification)

- Tomsk timezone corrected: fabricated 'TSST' abbreviation replaced with correct Krasnoyarsk Time (KRAT), UTC+7 year-round. Noted Russia abolished DST in 2014.
- GCI004 station abbreviation fixed: 'Coronation, CA' (ambiguous with California) changed to 'Coronation, AB' (Alberta).
- proton_flux column renamed to proton_density in space_weather schema to match the actual OMNI HAPI parameter name and physical quantity.
- ae_index and f10_index columns added to space_weather schema. These OMNI parameters were listed in Section 2.2 but had no columns to store them.
- imagescript description corrected: 'pure TypeScript' changed to 'zero-dependency TypeScript + WASM' to accurately describe its internal architecture.
- Section 8.3 substantially expanded: Now covers three tiers (established physics, preliminary research, pseudoscience) with specific debunking of 'time is speeding up,' spectrogram misreadings, commercial resonators, and conspiracy claims. Includes design implications for handling these audiences honestly.
- Lightning rate corrected: ~50 → ~44 (±5) flashes/sec based on satellite measurements (OTD/LIS), with seasonal range 35–55. Three thunderstorm center peaks given as precise UTC values (9, 14, 20 UT) from literature.
- Solar-SR relationship quantified in prediction section: F10.7 increase of ~150 sfu raises mode 1 frequency by ~0.1 Hz.
- Seasonal frequency variation quantified: ~0.15 Hz for mode 1, ~0.3 Hz for mode 2, ~0.43 Hz for mode 3 between summer and winter.
- Q-burst detection added to anomaly detection (Section 6.8): defined as 10× background transients from intense lightning, with detection threshold, separate logging, and distinct visual marker.
- CSES satellite context added to Section 12: space-based SR detection exists (China's CSES extracted modes 1–2 from orbit) but is not suitable as a live monitoring feed.
- Scientific applications expanded in Tier 1: added gravitational wave detector context (SR is correlated noise in LIGO/KAGRA/Einstein Telescope), tropical temperature relationship (power doubles per ~1°C), and hydrocarbon survey use.
- Section 15 added: Implementation Decisions (Open) — consolidates 7 areas where the developer or AI agent must make choices before coding: Edge Function inventory, project structure, Zustand store shape, scraping frequencies, data retention, storage buckets, and error/retry patterns. Each includes sensible defaults and explicit decision points.
- Section 10 reorganized for session-by-session development: each phase now has 4 subsections — Read (which sections to reference), Ask the User (decision points), Build (tasks), Done When (exit criteria). Designed so a Claude Code session can read one phase block and know exactly what to do without loading the full document.

---

## 2. Data Sources (Verified March 4, 2026)

### 2.1 Primary SR Data — Concrete Scraping Targets

#### HeartMath GCI (GCMS)

**Status:** Active. 6 stations: California (GCI001), Saudi Arabia (GCI002), Lithuania (GCI003), Alberta (GCI004), New Zealand (GCI005), South Africa (GCI006).

**Data:** Spectrograms 1–50 Hz, SR power per site (sum of 0.32–36 Hz) updated hourly with 24-hour moving average.

#### Station Coordinates Reference

These coordinates are needed for the 3D globe (Section 6.3) and are used as constants in the codebase. Tomsk and Cumiana coordinates are for the observatories themselves.

| Station ID | Location | Latitude | Longitude |
|------------|----------|----------|-----------|
| GCI001 | Boulder Creek, California, USA | 37.1° N | -122.2° W |
| GCI002 | Hofuf, Saudi Arabia | 25.4° N | 49.6° E |
| GCI003 | Kaunas region, Lithuania | 54.9° N | 23.9° E |
| GCI004 | Coronation, Alberta, Canada | 52.1° N | -111.4° W |
| GCI005 | Northland, New Zealand | -35.3° S | 174.1° E |
| GCI006 | Hluhluwe, South Africa | -28.0° S | 32.3° E |
| TOMSK | Tomsk, Siberia, Russia | 56.5° N | 84.9° E |
| CUMIANA | Cumiana (Turin), Italy | 44.9° N | 7.4° E |

As a TypeScript constant for the 3D globe and charts:

```typescript
export const STATIONS = {
  heartmath_gci001: { name: 'Boulder Creek, CA', lat: 37.1, lon: -122.2, color: '#58A6FF' },
  heartmath_gci002: { name: 'Hofuf, SA', lat: 25.4, lon: 49.6, color: '#E3B341' },
  heartmath_gci003: { name: 'Kaunas, LT', lat: 54.9, lon: 23.9, color: '#3FB950' },
  heartmath_gci004: { name: 'Coronation, AB', lat: 52.1, lon: -111.4, color: '#F0883E' },
  heartmath_gci005: { name: 'Northland, NZ', lat: -35.3, lon: 174.1, color: '#BC8CFF' },
  heartmath_gci006: { name: 'Hluhluwe, ZA', lat: -28.0, lon: 32.3, color: '#F85149' },
  tomsk:            { name: 'Tomsk, RU', lat: 56.5, lon: 84.9, color: '#FFFFFF' },
  cumiana:          { name: 'Cumiana, IT', lat: 44.9, lon: 7.4, color: '#79C0FF' },
} as const;
```

> **NEW IN v4.0 — HeartMath Backend Discovery:** The actual data backend lives at nocc.heartmath.org (Network Operations Control Center), not on the main heartmath.org site. This changes the entire scraping strategy.

#### Spectrogram Calendar (Server-Rendered PHP — No JavaScript Required)

The spectrogram calendar at nocc.heartmath.org/spectrogram/index.php is a plain PHP page that returns fully-rendered HTML with `<img>` tags in a table. Each row is one station (GCI001–GCI006), each column is one day. Date navigation uses query parameters: `?d=YYYY-MM-DD`. This page does NOT require JavaScript rendering — a simple HTTP GET returns all image URLs directly.

**Scraping strategy:** HTTP GET to fetch the HTML, parse with a DOM parser (DOMParser in Deno or regex for the `<img>` src attributes), extract the spectrogram image URLs, then fetch each image and store in Supabase Storage. The image filenames include the date and site ID.

**Fallback domain:** nocc.glcoherence.org/spectrogram/index.php serves the same calendar.

#### Power Chart Data (Highcharts XHR Endpoint)

The SR Power chart at nocc.heartmath.org/power_levels/public/charts/power_levels.html is a Highcharts widget that renders client-side. Highcharts typically loads its data from a backend endpoint (JSON or CSV) via XHR, though it can also accept inline data embedded in the page JavaScript. For a dynamic, multi-station chart like this one that updates hourly, an XHR data source is the most likely pattern.

**Discovery process at development time:** Open the power_levels.html page in Chrome, open DevTools > Network tab, filter by XHR/Fetch, reload the page, and identify the data endpoint. This will be a URL returning JSON or CSV with timestamps and power values for each station. Once discovered, fetch this endpoint directly from the Edge Function — no browser needed.

> **IMPORTANT:** All Puppeteer and browserless.io references from v3.1 are removed. Both HeartMath data channels are accessible via plain HTTP requests from Supabase Edge Functions.

**Colormap:** Yellow = most intense power. Blue/dark = low power. Green = moderate.

#### Tomsk State University (Space Observing System)

**Status:** Active. Updated today (March 4, 2026). The Tomsk homepage at sosrff.tsu.ru now redirects to sos70.ru, but the actual spectrogram images are still served from the old domain.

**Verified working image URLs:**

- https://sosrff.tsu.ru/new/shm.jpg ← Main spectrogram (3-day, 1–40 Hz)
- https://sosrff.tsu.ru/new/srf.jpg ← Frequency per mode vs. local time
- https://sosrff.tsu.ru/new/sra.jpg ← Amplitude per mode vs. local time
- https://sosrff.tsu.ru/new/srq.jpg ← Q-factor per mode vs. local time

These URLs append a date query string for cache-busting (e.g., `?20260304`) but the base URL is stable. Each image is updated roughly every 15 minutes. Time reference: Krasnoyarsk Time (KRAT) = UTC+7 year-round. Russia abolished daylight saving time in 2014; the offset does not change seasonally.

**Colormap:** White = most intense. Green = moderate. Blue = low. Black = no data (equipment downtime, NOT a geophysical event).

**Fallback URL:** If sosrff.tsu.ru goes offline, the new site sos70.ru serves the same data. Additionally, GeoCenter.info proxies these images via weserv.nl image CDN.

#### GeoCenter.info

**Status:** Active at geocenter.info/en/monitoring/schumann. GeoCenter does not operate its own station. It embeds Tomsk images proxied through images.weserv.nl (an image CDN). The actual image source is sosrff.tsu.ru. Useful as a fallback if the direct Tomsk URLs are blocked, but does not provide independent data.

#### Cumiana VLF Observatory (Italy)

**Status:** Active at vlf.it/cumiana/livedata.html. Operated by Renato Romero (IK1QFK). Data: ELF spectrograms (0.1–35 Hz magnetic field from induction coil), updated every 30 minutes. Also provides geophone seismic data and VLF electric field data. Sensitivity: 1 picoTesla at 1 Hz.

This station provides an independent European measurement, valuable for multi-station comparison with the Tomsk (Siberia) and HeartMath (global) stations.

### 2.2 Supplementary Data (NASA / NOAA) — Concrete Endpoints

#### NOAA SWPC — Real-Time Space Weather

**Base URL:** https://services.swpc.noaa.gov — All endpoints return JSON. No API key required. Rate-limit requests to 1 request per endpoint per 5 minutes.

| Endpoint | Data | Update Freq |
|----------|------|-------------|
| /products/noaa-planetary-k-index-forecast.json | Kp index (3-hourly geomagnetic activity, 0–9) | Every 3 hours |
| /json/planetary_k_index_1m.json | 1-minute Kp estimate | Every minute |
| /products/kyoto-dst.json | Dst index (ring current intensity) | Hourly |
| /products/solar-wind/mag-1-day.json | IMF Bz component (nT) | Every minute |
| /products/solar-wind/plasma-1-day.json | Solar wind speed (km/s) and density | Every minute |
| /products/alerts.json | Active alerts, watches, warnings | As issued |
| /json/goes/primary/xrays-1-day.json | GOES X-ray flux (solar flares) | Every minute |

> **IMPORTANT:** SWPC is updating some JSON formats effective March 31, 2026. Build schema-flexible parsing. Test against new formats before that date.

#### NASA OMNI via CDAWeb HAPI — Historical Backfill

**HAPI endpoint:** https://cdaweb.gsfc.nasa.gov/hapi

**Dataset ID:** OMNI2_H0_MRG1HR (hourly merged OMNI data, 1963–present)

**Key parameters (exact HAPI names):** KP1800 (Kp index), DST1800 (Dst index), AE_INDEX (AE index), flow_speed (solar wind speed), BZ_GSE (IMF Bz), proton_density, F10_INDEX (solar radio flux).

> **IMPORTANT:** The naming convention varies per parameter — some use a cadence suffix (e.g., DST1800 for 1800-second cadence) while others use a descriptive suffix (e.g., AE_INDEX). Always call /info first to confirm exact parameter names: `GET https://cdaweb.gsfc.nasa.gov/hapi/info?id=OMNI2_H0_MRG1HR`

Example HAPI request to fetch one month of data:

```
GET https://cdaweb.gsfc.nasa.gov/hapi/data?id=OMNI2_H0_MRG1HR
  &parameters=DST1800,KP1800,flow_speed,BZ_GSE
  &time.min=2025-01-01T00:00:00Z&time.max=2025-02-01T00:00:00Z&format=csv
```

Response is CSV with header row. Backfill at least 1 year on initial setup, then poll daily for updates. OMNI uses 9999.99 or 999.9 as fill values for missing data — convert these to NULL on insert.

> **NOTE:** SPDF services (including CDAWeb) are scheduled for a server move around March 9, 2026. Expect intermittent outages. Build retry logic.

#### Blitzortung — Global Lightning

Blitzortung.org is a community-based lightning detection network. Data access for third-party apps requires using your own intermediate server (per their data usage policy). This is marked as optional — it enriches the analysis but is not required for core SR monitoring.

---

## 3. Technology Stack

### 3.1 Backend + Database: Supabase

Supabase provides managed PostgreSQL with TimescaleDB Apache 2 Edition available as an extension.

- **TimescaleDB hypertables:** Time-based partitioning with the `time_bucket()` function for efficient aggregation queries over large time ranges.
- **Supabase Realtime:** WebSocket subscriptions push new rows to the frontend as they are inserted. Subscribe to the `sr_readings` table for live chart updates.
- **Supabase Edge Functions:** Deno-based serverless functions for the scrapers. Triggered on schedule via pg_cron + pg_net extensions.
- **Supabase Storage:** Store raw spectrogram images (the originals fetched from each source) for audit and reprocessing.
- **pg_cron:** Schedule Edge Function invocations directly from the database. Supports cron syntax down to 1-second intervals.

#### Supabase Limitations and Workarounds

- **Apache 2 Edition only:** Community-only features (continuous aggregates, compression, data retention policies) are NOT available. Workaround: use PostgreSQL materialized views refreshed by pg_cron for aggregation, and scheduled DELETE queries for data retention.
- **Postgres version:** TimescaleDB is deprecated on Postgres 17 in Supabase. When creating your Supabase project, select Postgres 15 or 16. If you must use Postgres 17, use standard PostgreSQL range partitioning with pg_partman instead.
- **Connection limits:** Lower-tier plans have limited direct connections. Use Supavisor (Supabase built-in pooler) for scraper Edge Functions.
- **Edge Function timeout:** Default 60-second execution limit. Image processing (downloading + pixel extraction) should complete within this, but add a fallback queue pattern for reliability.

### 3.2 Frontend: Next.js + shadcn/ui + ECharts + Three.js + Tone.js

> **NEW IN v4.0 — Unified Charting:** Apache ECharts replaces the previous Recharts + D3.js split. One library, one API, one mental model.

**Framework:** Next.js (App Router). The frontend queries Supabase directly using @supabase/supabase-js client library with the anon key for public read access. No Next.js API routes are needed for data reads. Use Next.js API routes only for: triggering manual scraper runs, handling data exports, and any server-side processing that requires the service_role key.

**Charting:** Apache ECharts (via echarts-for-react)

ECharts is the single charting library for the entire application. It handles every visualization type needed:

- **Heatmap series** for spectrograms (time x frequency x power). Replaces the D3 canvas heatmap from v3.1.
- **Line series** for time-series (SR amplitude, Kp, Dst, solar wind). Replaces Recharts.
- **Scatter series** for correlation analysis. Replaces Recharts scatter.
- **Custom series** for the animated pulsing spectrogram effect.
- **Heatmap with calendar** for correlation matrices.

ECharts uses a declarative JSON configuration (the `option` object) — you describe WHAT to render, not HOW. This is critical for AI-assisted development: Claude Code and Cursor can generate and modify option objects far more reliably than imperative D3 binddata-bindenter-bindupdate chains.

ECharts supports WebGL rendering (Canvas + GL) for large datasets. Switch renderer per chart: use SVG for small interactive charts, Canvas/GL for spectrograms with thousands of data points.

**Real-time updates:** ECharts detects dataset differences and animates transitions automatically. Just pass new data to `setOption()` and the chart morphs smoothly.

```bash
npm install echarts echarts-for-react
```

**3D Visualization:** Three.js via react-three-fiber

The 3D globe showing station locations with live data ribbons uses react-three-fiber (R3F), the React renderer for Three.js. R3F lets you build Three.js scenes with JSX components, which is highly compatible with AI-assisted development.

```bash
npm install three @react-three/fiber @react-three/drei
```

The globe component renders a textured sphere with station markers at lat/lon coordinates. Each station projects a glowing ribbon upward from the surface, with height and color mapped to current SR amplitude. The ribbons pulse gently to convey live data.

**Sonification:** Tone.js

Tone.js is a Web Audio framework for creating interactive music and sound in the browser. The sonification feature maps SR data to audio parameters:

- Fundamental frequency (~7.83 Hz) mapped to an audible carrier (220 Hz = musical A3, amplitude-modulated by the actual SR frequency).
- Amplitude mapped to volume — louder when SR power is higher.
- Harmonic modes as overtones — modes 2–6 add harmonic content to the sound.
- Space weather modulates timbre — high Kp adds distortion/noise, calm conditions produce pure tones.

```bash
npm install tone
```

HeartMath themselves do this: their Boulder Creek site has a 3-minute audio sample of resonance data shifted to audible range. This app will offer real-time sonification, not just playback of a clip.

**Particle Animation:** HTML Canvas or Three.js Particle System

An ambient particle field overlaying the dashboard background. Particles represent the resonant energy of the Earth-ionosphere cavity. Their density, speed, and color respond to current SR amplitude: calm conditions produce sparse, slow, blue particles; elevated conditions produce dense, fast, gold particles. This creates an ambient awareness of resonance state without requiring the user to read a chart.

**Implementation:** Use a Canvas 2D overlay for performance (2D particles are cheaper than WebGL 3D). The particle system reads from a Zustand store that is updated whenever new SR data arrives via Supabase Realtime.

**Real-time Data:** Initialize the Supabase client and subscribe to INSERT events:

```javascript
const channel = supabase.channel('sr-live')
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'sr_readings'
  }, payload => {
    appendToChart(payload.new);
    updateParticles(payload.new);
    updateSonification(payload.new);
  })
  .subscribe()
```

**Date range picker:** Use shadcn/ui Calendar + Popover components to build a DateRangePicker. The shadcn ecosystem includes a community DateRangePicker with preset ranges (Last 7 days, Last 30 days, etc.).

**Layout:** CSS Grid dashboard with shadcn/ui Card components. Resizable panels via react-resizable-panels.

### 3.3 Auth & Access Control

For an initial version, the app can be fully public (read-only dashboard). Supabase RLS policies:

- **Public tables** (sr_readings, space_weather, sr_spectrograms, source_health): Enable RLS with a policy allowing SELECT for the anon role. No INSERT/UPDATE/DELETE for anon.
- **Admin operations** (scraper health, manual triggers): Require authenticated user with admin role. Use Supabase Auth with email/password for admin login.
- **Edge Functions:** Authenticate with the service_role key stored in Supabase Vault. Called internally by pg_cron, never exposed to the frontend.

### 3.4 Deployment

- **Frontend (Next.js):** Deploy to Vercel. Zero-config for Next.js. Set environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Database:** Supabase Cloud (managed). Choose a region close to your primary user base.
- **Edge Functions:** Deploy via Supabase CLI (`supabase functions deploy`). They run on Supabase Deno edge network.
- **Domain:** Point custom domain to Vercel. Supabase exposes its API at `<project-ref>.supabase.co`.

---

## 4. Visual Design System — Dark Cosmos

> **NEW IN v4.0 — Design Philosophy:** The same data, rendered so a scientist sees precision and an explorer sees wonder. Not two modes — one unified experience where beauty IS the data.

### 4.1 Core Visual Identity

The design language is **Dark Cosmos** — inspired by the ionosphere itself: deep space backgrounds with aurora-like glows, luminous data traces, and a sense of vast, living energy. The dark background makes data glow, literally: spectrogram colors become more vivid, chart lines become luminous traces, and particle effects become visible atmosphere.

This is not a dark theme applied to a standard dashboard. The darkness is functional: it mimics how scientists actually work with spectrogram data (always on dark backgrounds for contrast), while creating the immersive quality that the explorer audience responds to.

#### Color Palette

| Role | Value | Usage |
|------|-------|-------|
| Background Base | `#0D1117` | Page background, card interiors |
| Background Elevated | `#161B22` | Cards, panels, modals |
| Surface | `#21262D` | Hover states, active elements |
| Border | `#30363D` | Card borders, dividers |
| Text Primary | `#E6EDF3` | Headings, important text |
| Text Secondary | `#8B949E` | Labels, descriptions, metadata |
| Accent Blue | `#58A6FF` | Primary actions, links, live data |
| Accent Green | `#3FB950` | Healthy status, normal range |
| Accent Gold | `#E3B341` | Warnings, elevated readings (2σ) |
| Accent Red | `#F85149` | Alerts, anomalies (3σ) |
| Accent Purple | `#BC8CFF` | Predictions, overlays, secondary info |
| Glow Blue | `rgba(88,166,255,0.15)` | Halo around live data elements |
| Glow Gold | `rgba(227,179,65,0.2)` | Pulse around elevated readings |

#### Typography

**Display font:** JetBrains Mono or Space Mono — for data values, chart labels, and the resonance frequency readout. Monospace fonts are both scientifically precise AND aesthetically distinctive.

**Body font:** Plus Jakarta Sans or DM Sans — clean, modern, high readability on dark backgrounds. These are specific enough to avoid generic AI aesthetics while being highly legible.

**Accent font:** For the large frequency display (e.g., the big "7.83 Hz" on the dashboard), use the display font at 48–72px with a subtle text-shadow glow in Accent Blue.

#### ECharts Dark Cosmos Theme

Register this theme once at app initialization. All ECharts instances then use it via `<ReactECharts theme='darkCosmos' />`.

```javascript
import * as echarts from 'echarts';

echarts.registerTheme('darkCosmos', {
  backgroundColor: '#0D1117',
  textStyle: { color: '#8B949E', fontFamily: 'JetBrains Mono, monospace' },
  title: { textStyle: { color: '#E6EDF3' } },
  legend: { textStyle: { color: '#8B949E' } },
  tooltip: {
    backgroundColor: '#161B22', borderColor: '#30363D',
    textStyle: { color: '#E6EDF3', fontFamily: 'JetBrains Mono, monospace' },
  },
  xAxis: { axisLine: { lineStyle: { color: '#30363D' } },
           splitLine: { lineStyle: { color: '#21262D' } } },
  yAxis: { axisLine: { lineStyle: { color: '#30363D' } },
           splitLine: { lineStyle: { color: '#21262D' } } },
  color: ['#58A6FF','#3FB950','#E3B341','#F85149','#BC8CFF','#F0883E',
          '#79C0FF','#56D364','#D29922','#FF7B72'],
  visualMap: {
    inRange: { color: ['#0D1117','#1A1A4E','#2D1B69','#6B2D8B',
              '#C850C0','#FF6B6B','#FFD93D','#FFFFED'] },
    textStyle: { color: '#8B949E' },
  },
});
```

#### Motion & Animation Principles

- **Everything breathes:** Subtle pulse animations (opacity 0.8–1.0 at ~0.5 Hz) on live data elements convey "this is alive." Never freeze-frame.
- **Data transitions morph, not jump:** When switching time ranges or sources, charts animate smoothly between states (ECharts handles this natively with setOption transitions).
- **Particle field as ambient indicator:** The background particle system responds to data state, creating unconscious awareness of resonance conditions.
- **Glow intensity = data intensity:** Elements glow brighter when their data value is elevated. A spectrogram cell at max power literally illuminates the surrounding area via CSS box-shadow or canvas glow.
- **Staggered reveals on page load:** Cards and panels animate in with a 50ms stagger delay, creating a cascade effect. Use Framer Motion for orchestrated mount animations.

### 4.2 Spectrogram as Living Canvas

The spectrogram is the centerpiece of the application. In v4.0 it is not a static heatmap — it is an animated, breathing canvas that conveys the live energy of the Earth-ionosphere cavity.

#### Implementation with ECharts Heatmap

ECharts heatmap series renders a 2D grid where X = time, Y = frequency (1–50 Hz), and color = power. The configuration:

```javascript
option = {
  tooltip: { ... },
  grid: { top: 30, right: 30, bottom: 60, left: 60 },
  xAxis: { type: 'time', splitLine: { show: false } },
  yAxis: { type: 'value', min: 0, max: 50, name: 'Frequency (Hz)' },
  visualMap: {
    min: 0, max: maxPower, calculable: true,
    inRange: { color: ['#0D1117','#1A1A4E','#2D1B69','#6B2D8B','#C850C0',
                       '#FF6B6B','#FFD93D','#FFFFED'] }
  },
  series: [{ type: 'heatmap', data: heatmapData, progressive: 1000 }]
}
```

The custom colormap progresses from deep space black through ionospheric purple and aurora pink to solar gold and white — an earth-to-ionosphere gradient that is both scientifically informative (darker = less power) and visually stunning.

#### Pulsing Animation Effect

The spectrogram pulses to convey live energy. Implementation: overlay a semi-transparent radial gradient on the most recent time column that oscillates in opacity. Use `requestAnimationFrame` for smooth 60fps animation. The pulse rate can be tied to the current dominant SR frequency (slowed way down — e.g., one pulse per second for 7.83 Hz, slightly faster for elevated frequencies).

Additionally, new data arriving via Supabase Realtime triggers a brief "wave" animation that ripples across the spectrogram from right (newest) to left, like a shockwave of new information entering the display.

### 4.3 Dashboard Layout

The dashboard uses a CSS Grid layout with five zones:

- **Hero Zone (top):** Full-width spectrogram with animated pulse. Below it, the six mode cards (one per SR harmonic) showing current frequency, amplitude, and 24h sparkline.
- **Globe Zone (top-right or collapsible panel):** 3D interactive globe with station markers and live data ribbons. Can be collapsed to give full width to the spectrogram.
- **Correlation Zone (middle):** Time-series overlay chart with multi-variable toggle. Space weather data overlaid on SR data.
- **Analysis Zone (bottom-left):** Scatter plot, lag analysis, correlation matrix — the research tools.
- **Status Zone (bottom-right):** Source health, data freshness indicators, anomaly log. Sonification controls here.

All panels are resizable via react-resizable-panels. The layout is responsive: on mobile, the zones stack vertically with the spectrogram always on top.

---

## 5. Database Schema (Supabase / TimescaleDB)

All tables use `timestamptz` columns in UTC. Enable TimescaleDB and convert primary tables to hypertables.

### 5.1 Setup SQL

```sql
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE sr_readings (
  time          TIMESTAMPTZ NOT NULL,
  source_id     TEXT NOT NULL,        -- 'heartmath_gci001', 'tomsk', 'cumiana'
  mode_number   SMALLINT NOT NULL,    -- 0=total power, 1-6=individual modes
  frequency_hz  DOUBLE PRECISION,     -- e.g. 7.83
  amplitude_pt  DOUBLE PRECISION,     -- picoTesla
  power_density DOUBLE PRECISION,     -- pT²/Hz
  q_factor      DOUBLE PRECISION,
  raw_timestamp TEXT,                  -- original source timestamp (audit)
  UNIQUE (time, source_id, mode_number)
);
SELECT create_hypertable('sr_readings', 'time');
CREATE INDEX idx_sr_source_time ON sr_readings (source_id, time DESC);

CREATE TABLE space_weather (
  time              TIMESTAMPTZ NOT NULL,
  kp_index          DOUBLE PRECISION,
  dst_index         DOUBLE PRECISION,
  solar_wind_speed  DOUBLE PRECISION,
  bz_component      DOUBLE PRECISION,
  proton_density   DOUBLE PRECISION,
  ae_index         DOUBLE PRECISION,
  f10_index        DOUBLE PRECISION,
  flare_class       TEXT,
  UNIQUE (time)
);
SELECT create_hypertable('space_weather', 'time');

CREATE TABLE sr_spectrograms (
  id         BIGSERIAL PRIMARY KEY,
  time       TIMESTAMPTZ NOT NULL,
  source_id  TEXT NOT NULL,
  image_path TEXT NOT NULL,    -- path in Supabase Storage
  processed  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_spectro_source ON sr_spectrograms (source_id, time DESC);

CREATE TABLE source_health (
  id            BIGSERIAL PRIMARY KEY,
  time          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_id     TEXT NOT NULL,
  status        TEXT NOT NULL,    -- 'ok', 'error', 'timeout'
  latency_ms    INTEGER,
  error_message TEXT
);
```

### 5.2 Materialized View for Hourly Aggregation

```sql
CREATE MATERIALIZED VIEW sr_hourly_agg AS
SELECT
  time_bucket('1 hour', time) AS bucket,
  source_id, mode_number,
  AVG(amplitude_pt) AS avg_amplitude,
  MAX(amplitude_pt) AS max_amplitude,
  AVG(frequency_hz) AS avg_frequency,
  STDDEV(amplitude_pt) AS stddev_amplitude,
  COUNT(*) AS sample_count
FROM sr_readings
GROUP BY bucket, source_id, mode_number;

CREATE UNIQUE INDEX idx_hourly_agg_unique
  ON sr_hourly_agg (bucket, source_id, mode_number);

SELECT cron.schedule('refresh-sr-agg', '0 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY sr_hourly_agg$$);
```

---

## 6. Core Features

### 6.1 Live Spectrogram Display

The centerpiece: an animated heatmap rendered with ECharts. X-axis = time (most recent right), Y-axis = frequency (1–50 Hz), color = power using the custom Dark Cosmos colormap. SR modes appear as bright horizontal bands.

- **Default view:** 24 hours. Quick-zoom buttons: 1h, 6h, 24h, 3d, 7d.
- **Source selector:** shadcn/ui Select to switch stations or view "All" stacked vertically.
- **Hover readout:** ECharts tooltip with exact time, frequency, and power at cursor position.
- **Pulsing effect:** The newest data column glows with a breathing animation. New data arrivals trigger a ripple wave across the display.

### 6.2 Mode Tracker Panel

Six shadcn/ui Card components (one per SR mode), each showing: current frequency with deviation from nominal (in Hz, with glow color indicating magnitude), current amplitude in picoTesla, 24-hour sparkline (ECharts mini line chart), and a status badge (green/gold/red based on deviation from rolling 7-day mean). The cards subtly pulse at a rate derived from their respective mode frequency.

### 6.3 3D Globe with Live Data Ribbons

> **NEW IN v4.0 — 3D Globe:** Interactive Earth with station markers and live data ribbons.

The globe is built with react-three-fiber and @react-three/drei. Implementation:

- **Earth sphere:** Textured mesh using a free NASA Blue Marble texture (or a stylized dark-earth texture consistent with the Dark Cosmos theme).
- **Station markers:** Glowing points at each station's lat/lon, with a label on hover. Colors match the station's color in other charts for consistency.
- **Data ribbons:** From each station, a vertical ribbon extends upward from the surface. The ribbon's height represents current SR amplitude, its color represents the dominant frequency, and its opacity pulses with new data arrivals. Implemented as a custom BufferGeometry or ExtrudeGeometry.
- **Interaction:** Drag to rotate, scroll to zoom. Auto-rotates slowly when idle. Double-click a station to zoom in and switch all charts to that station's data.
- **Performance:** Use drei's `<Stars />` component for a starfield background. Keep polygon count low. The globe is a single panel in the dashboard, not a full-screen background.

### 6.4 Sonification Engine

> **NEW IN v4.0 — Sonification:** Hear the Schumann Resonance as sound.

The sonification engine uses Tone.js to map SR data to audio in real-time.

#### Audio Mapping

- **Base tone:** A sine oscillator at an audible frequency (e.g., 220 Hz = musical A3). The oscillator is amplitude-modulated at the actual SR fundamental frequency (~7.83 Hz), creating an audible beat that IS the Schumann Resonance.
- **Harmonics:** Modes 2–6 add harmonic oscillators at proportional frequencies. When a higher mode is active (elevated amplitude), its harmonic becomes audible in the mix.
- **Volume:** Overall gain mapped to total SR power. Quiet conditions = soft ambient. Storms = louder, richer.
- **Timbre:** Kp index modulates a low-pass filter — calm conditions (Kp < 3) produce warm, filtered tones. Storm conditions (Kp > 5) open the filter for bright, buzzy tones, and add subtle noise.
- **Spatial:** If multiple stations are sonified, pan them in stereo based on longitude (California left, New Zealand right).

#### User Controls

- Master volume slider with mute toggle.
- Speed control: real-time (data arrives every few minutes — very slow), or accelerated playback of historical data (1 day in 60 seconds).
- Mode selector: which modes to include in the sonification.
- The audio only starts on user interaction (click/tap) per browser autoplay policy.

### 6.5 Animated Particle Flow

> **NEW IN v4.0 — Particle Flow:** Ambient visual indicator of resonance intensity.

A full-viewport Canvas 2D overlay behind the dashboard content (z-index: -1). The particle system creates an ambient sense of the Earth's electromagnetic state:

- **Particle count:** 50–300, dynamically scaled to current SR amplitude.
- **Motion:** Particles drift upward slowly (simulating ionospheric energy flow). Speed increases with amplitude.
- **Color:** Particles use the same color scale as the spectrogram — blue for calm, purple for moderate, gold/white for elevated.
- **Size:** Larger particles during elevated conditions.
- **Interaction:** Particles gently repel from the mouse cursor (optional, small radius).

The particle system reads from a global state store (Zustand recommended) that is updated on every Supabase Realtime event. This decouples the animation from chart rendering. The particle Canvas runs its own `requestAnimationFrame` loop at 30–60 fps independent of React renders.

### 6.6 Historical Trend Explorer

The primary research tool. Queries `sr_hourly_agg` for periods > 7 days, raw `sr_readings` for shorter periods.

#### Date Selection

- **Preset buttons:** 24h | 7d | 30d | 90d | 1y — rendered as shadcn/ui ToggleGroup.
- **Custom range:** shadcn/ui Calendar-based date range picker for arbitrary start/end dates.
- **Single date:** Click one date to see that full day at raw resolution.
- **Today:** Quick jump to live data.

#### Visualization Controls

- **Multi-variable overlay:** Toggle any combination of SR amplitude, Kp, Dst, solar wind speed, lightning rate. Dual Y-axes. All rendered in a single ECharts instance with shared zoom/pan.
- **Period comparison:** Select two date ranges and overlay them (e.g., same week in March 2025 vs. 2026).
- **Rolling statistics:** Toggle 24h or 7d rolling mean with standard deviation bands.
- **Export:** CSV or JSON download via Next.js API route that queries Supabase.

### 6.7 Correlation Analysis

- **Scatter plot:** Select any two variables. Linear regression line + Pearson r. ECharts scatter with markLine for regression.
- **Lag analysis:** Shift one series by N hours to test delayed correlations. Slider control for lag offset.
- **Heatmap matrix:** Pairwise correlation across all variables for selected time range. ECharts heatmap with annotated cells.

### 6.8 Anomaly Detection

- **Baseline:** Rolling 30-day mean/stddev per mode from `sr_hourly_agg`.
- **Thresholds:** Flag 2σ (gold glow) and 3σ (red glow) excursions.
- **Q-burst detection:** Q-bursts are transient signals from exceptionally intense lightning discharges that exceed background SR amplitude by 10× or more. They appear as isolated spikes with ~10-second intervals and can be used to determine source lightning location. The pipeline should flag any single reading exceeding 10× the rolling median as a candidate Q-burst event, log it separately, and display it as a distinct marker (not just a threshold excursion). Q-bursts are scientifically valuable — they carry source-distance information.
- **Event log:** shadcn/ui DataTable: timestamp, duration, peak amplitude, concurrent conditions (Kp, flare class, Q-burst flag).
- **Visual markers:** Shaded bands on time-series charts during flagged periods (ECharts markArea). Q-bursts get a distinct pin marker rather than a band.

### 6.9 "What's Happening Now" Summary

> **NEW IN v4.0 — Plain Language Summary:** A single sentence describing current conditions, generated from the latest data.

A card at the top of the dashboard with a one-sentence human-readable summary generated from the latest readings. Examples:

- "Schumann Resonance is in normal range across all stations. Kp is 2 (quiet). Solar wind 380 km/s."
- "SR amplitude is elevated (+2.1σ above 30-day mean). Kp is 5 (moderate storm). Solar wind 580 km/s. This pattern is consistent with geomagnetic disturbance."
- "Tomsk data is offline (last update 4 hours ago). HeartMath and Cumiana show normal conditions."

This is not AI-generated — it is template-based string interpolation from the latest data values and their statistical context. This ensures accuracy and avoids hallucination.

---

## 7. Prediction Features

Prediction is included for patterns that have established physical drivers. The app frames predictions as "expected ranges based on historical patterns," not point forecasts.

### 7.1 What IS Predictable

- **Diurnal envelope:** The 24-hour amplitude cycle tracks daily rotation of three global thunderstorm centers. In the vertical electric field (direction-independent, thus measuring global activity), three distinct maxima appear: ~9 UT (SE Asia), ~14 UT (Africa, consistently the strongest), ~20 UT (Americas). The magnetic field components show directional dependence relative to observer location. A time-of-day model from 30-day rolling data predicts next-24h amplitude range reliably.
- **Seasonal baseline:** Annual cycle driven by hemispheric thunderstorm seasonality. Amplitude peaks in northern hemisphere summer (June–August). Frequency shows an inverse seasonal pattern: mode 1 varies by ~0.15 Hz between summer and winter, mode 2 by ~0.3 Hz, mode 3 by ~0.43 Hz. Monthly average per mode provides expected range.
- **Solar-driven perturbations:** When a solar flare or geomagnetic storm is in progress (from NOAA SWPC), SR parameters will likely be perturbed for several hours. The relationship is quantified: an increase in the F10.7 solar radio flux index by ~150 sfu raises the first SR mode frequency by ~0.1 Hz and elevates the magnetic characteristic height of the ionosphere by ~2.5 km. This gives the correlation panel concrete predictive value when overlaying F10.7 against SR frequency.
- **ML forecasting (experimental):** Published research (Tulunay et al., 2008; and a 2022 study using 6 ML algorithms) has shown SR frequency can be predicted from ionospheric parameters, with hour-dependent and mode-dependent accuracy.

### 7.2 Recommended Features

- **Expected diurnal envelope:** Shaded band on live chart showing the expected amplitude range for current hour-of-day, based on rolling 30-day average. Rendered as ECharts markArea with semi-transparent fill.
- **Seasonal baseline overlay:** Long-term monthly average as reference line on historical charts.
- **Space weather impact alert:** Banner when NOAA issues storm watch: "Geomagnetic disturbance expected — SR parameters may be elevated 6–12 hours." The particle system shifts to gold/orange tones.
- **Pattern matching:** Given 6+ months of data, nearest-neighbor or DTW search: "Find past days most similar to today's pattern." Results displayed as overlaid ghost traces on the spectrogram.

### 7.3 What to Avoid

Do not present numerical point forecasts without confidence intervals and disclaimers. Day-to-day variance is driven by chaotic weather dynamics. Individual amplitude spikes (Q-bursts from intense lightning) are stochastic and unpredictable in timing — they are detectable and scientifically interesting (see Section 6.8) but cannot be forecast. The fundamental frequency (~7.83 Hz) is stable and does not trend.

---

## 8. Understanding What You're Monitoring

### 8.1 The Schumann Resonance Is Global

SR frequencies are properties of the entire Earth-ionosphere cavity. The fundamental at ~7.83 Hz and harmonics at ~14.3, 20.8, 27.3, 33.8, and 39 Hz are the same everywhere on the planet. When the app shows data from Tomsk and HeartMath California side by side, the peak frequencies should agree to within ~0.1–0.2 Hz. Differences between stations reflect observation geometry relative to global thunderstorm centers, not local resonances.

### 8.2 Amplitude Varies by Station

The 24-hour amplitude pattern differs between stations because each sees a different geometric relationship to the three major thunderstorm centers (Africa, Southeast Asia, Americas). This multi-station amplitude contrast is one of the most scientifically valuable features of the dashboard — it reveals global thunderstorm source distribution. The 3D globe visualization makes this immediately intuitive.

### 8.3 Interpreting the Data — Science, Speculation, and Pseudoscience

#### Tier 1: Established Physics (Consensus)

The physics of Schumann Resonance is well understood and uncontroversial. The Earth-ionosphere cavity resonates at specific frequencies, excited primarily by global lightning activity (satellite measurements: ~44 ±5 flashes per second worldwide, ranging from ~35 in northern hemisphere winter to ~55 in summer). Changes in amplitude, frequency, and Q-factor are driven by lightning distribution, ionospheric conductivity (which varies with solar activity and day-night cycles), and geomagnetic conditions. The fundamental frequency (~7.83 Hz) is remarkably stable over decades. Day-to-day variations in amplitude are dominated by the diurnal rotation of three thunderstorm centers: Africa (peak ~14 UT), SE Asia (~9 UT), Americas (~20 UT). Africa is consistently the strongest contributor. This is what the app monitors.

Practical scientific applications include: global lightning climatology, tropical temperature monitoring (SR power doubles per ~1°C increase), ionospheric disturbance detection from solar flares, offshore hydrocarbon location via magnetotelluric surveys, potential detection of lightning on other planets (Venus, Jupiter, Titan), and — remarkably — characterizing correlated magnetic noise in gravitational wave detectors (LIGO, KAGRA, future Einstein Telescope), where SR appears as a sensitivity-limiting background signal. SR is not esoteric: it is a routine measurement in multiple branches of geophysics and experimental physics.

#### Tier 2: Legitimate but Preliminary Research (Peer-Reviewed, Debated)

A growing body of peer-reviewed research explores potential correlations between SR parameters and biological systems. Studies have examined relationships between SR frequencies and human heart rate variability (HRV), autonomic nervous system rhythms, blood pressure, sleep patterns, and melatonin levels. The HeartMath Institute's Global Coherence Initiative (GCI) has published research in this area. Some studies report statistically significant correlations; others find no effect. The fundamental challenge is that SR fields are extremely weak (~1 picoTesla) — orders of magnitude below the Earth's static magnetic field (~30–50 microTesla) and far below fields from household electronics. No established biophysical mechanism explains how such weak fields could influence human physiology. These remain legitimate areas of scientific inquiry, but findings are preliminary, often unreplicated, and debated within the scientific community.

#### Tier 3: Pseudoscience and Commercial Exploitation (No Scientific Basis)

A large online ecosystem of claims has grown around Schumann Resonance that goes far beyond what any peer-reviewed research supports. These are important for the app to be aware of because many users will arrive with these beliefs, and the app should not inadvertently reinforce them. The major categories:

- **'Time is speeding up':** A widely shared claim asserts that the Schumann frequency is 'rising' and that a 24-hour day now 'feels like' 16 hours. This is false. The fundamental frequency has remained near 7.83 Hz since measurements began in the 1960s. Measured changes in Earth's rotation are on the order of milliseconds per century, not hours.
- **'Consciousness awakening' / 'ascension symptoms':** Claims that SR amplitude spikes indicate mass consciousness shifts, spiritual awakenings, or dimensional transitions. Common ailments (headaches, fatigue, tinnitus, anxiety) are rebranded as 'ascension symptoms' correlated with spectrogram patterns. There is no scientific evidence for any of these claims. Science communicators and fact-checkers have described them as unfounded.
- **Spectrogram misreading:** 'Whiteouts' (saturated white spectrograms) and 'blackouts' (blank periods) are routinely interpreted as cosmic events, energetic shifts, or evidence of suppression. In reality, whiteouts are typically broadband interference (local RF noise, equipment malfunction), and blackouts are data gaps from equipment downtime or connectivity loss. The Tomsk station's own documentation explicitly states that black bars indicate 'no registration of data for some reason' — not geophysical events.
- **Commercial 'Schumann resonators':** Devices marketed as emitting 7.83 Hz to 'tune your body' to Earth's frequency sell for $20–$200+. There is no credible clinical evidence that these devices produce health benefits. Science writers have described this market as 'sham medicine' (BBC Sky at Night) and 'old-fashioned snake oil in electromagnetic clothing.'
- **'They don't want you to know':** Conspiratorial claims that governments, HAARP, or other institutions are suppressing or manipulating the Schumann Resonance. HAARP operates at megahertz frequencies, not the single-digit Hz of SR — the comparison is physically nonsensical. SR data from Tomsk, HeartMath, and other sources is freely and publicly available.

#### Why This Matters for the App

Many users of SR monitoring tools come from the consciousness and wellness communities. The app should respect these users without reinforcing false claims. Specific design implications:

- **Label data honestly:** Always show units, timestamps, and source attribution. Never label a data gap as anything other than a data gap. The 'What's Happening Now' summary (Section 6.9) uses template-based text, not AI generation, to prevent hallucinated interpretations.
- **Don't editorialize:** The app does not claim that SR spikes 'mean' anything beyond what the physics supports. It does not use language like 'energy shift,' 'awakening,' or 'activation.' It provides the tools to explore and lets every user — geophysicist, biophysics researcher, or consciousness explorer — pursue their own line of inquiry with honest, well-labeled data.
- **Experience layers are aesthetic, not interpretive:** The sonification, particle flow, and glow effects make the data viscerally accessible. They do not impose meaning. A brighter glow means higher amplitude — a physical measurement — not a spiritual event. The design is explicit about this: beauty IS the data, not a narrative about the data.
- **Acknowledge the full landscape:** Including an 'About the Data' page or info panel that briefly explains what SR is, what drives it, what the spectrograms show, and what the scientific consensus is — alongside a fair note that some communities interpret the data differently. This transparency builds trust with both audiences.

---

## 9. Data Pipeline — Implementation Detail

### 9.1 Spectrogram Image Extraction

This is the most technically challenging component. Most SR stations publish spectrograms as images, not structured data.

#### Pipeline for Tomsk Images

- **Fetch:** HTTP GET to sosrff.tsu.ru/new/sra.jpg (amplitude) and sosrff.tsu.ru/new/srf.jpg (frequency). Store raw image in Supabase Storage.
- **Crop:** Remove axis labels, title bar, and legend. The plot area boundaries are fixed for each source and can be calibrated once by manual measurement (pixel coordinates of the axes).
- **Map X-axis:** Horizontal pixels → time in Krasnoyarsk Time (UTC+7, year-round). The plot spans 24 hours for single-day images, 72 hours for the 3-day spectrogram (shm.jpg).
- **Map Y-axis:** Vertical pixels → frequency. Linear scale, 0–40 Hz top to bottom (Tomsk) or 1–50 Hz (HeartMath).
- **Map colors:** Each pixel's RGB → power value. For Tomsk: white=(255,255,255)→max, green→medium, blue→low, black=(0,0,0)→no data. Build a lookup table by sampling the published colorbar. For HeartMath: yellow→max, blue→low.
- **Extract modes:** For each of the 6 SR mode frequencies (~7.83, ~14.3, ~20.8, ~27.3, ~33.8, ~39 Hz), sample a horizontal stripe (±1 Hz wide) and find the peak power and exact peak row (refine frequency).
- **Validate:** Reject if frequency > 50 Hz or amplitude > 100 pT. Cross-check: mode 1 should be near 7.83 Hz, mode 2 near 14.3 Hz, etc.

> **IMPORTANT: Image Decoding in Deno Edge Functions:** Use the `imagescript` library (import from deno.land/x/imagescript), a zero-dependency TypeScript image manipulation library that uses WASM internally for decoding. It works natively in Deno without native C bindings, decodes JPEG and PNG, and provides per-pixel RGB access. Import: `import { Image } from 'https://deno.land/x/imagescript/mod.ts'`. Alternative: if imagescript cannot handle the JPEG encoding from Tomsk, use `imagemagick_deno` (ImageMagick compiled to WASM) or decode via the Canvas API available in Deno Deploy.

#### Pipeline for HeartMath (v4.0+ Architecture)

**Spectrogram Images — Simple HTTP scrape:**

- HTTP GET to `https://nocc.heartmath.org/spectrogram/index.php?d=YYYY-MM-DD`
- Parse the HTML response to extract `<img>` src attributes from the table. Each row = one station (GCI001–GCI006), each column = one day.
- Fetch each spectrogram image directly (the src URLs are relative to nocc.heartmath.org).
- Store in Supabase Storage and process with the same pixel-extraction pipeline as Tomsk images.

**Power Data — Highcharts XHR discovery:**

- At development time, open `https://nocc.heartmath.org/power_levels/public/charts/power_levels.html` in Chrome DevTools > Network > XHR filter.
- Identify the JSON/CSV endpoint that Highcharts calls to populate the chart. Record the URL, method, and any query parameters.
- In the Edge Function, fetch this endpoint directly. Parse the response (likely JSON with arrays of [timestamp, power] per station).
- Upsert into `sr_readings` table with `source_id = 'heartmath_gciNNN'`, `mode_number = 0` (total power convention), and the parsed power values in the `power_density` column. Individual per-mode data comes from the spectrogram image extraction pipeline, not the power chart.

#### Pipeline for NOAA SWPC (Straightforward)

- **Fetch:** HTTP GET to services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json every 5 minutes.
- **Parse:** JSON array of [timestamp, kp_value] pairs. Convert timestamp to UTC.
- **Insert:** Upsert into `space_weather` table (ON CONFLICT DO UPDATE to handle re-fetches).

#### Pipeline for OMNI Historical Backfill

- **Initial load:** Call CDAWeb HAPI for OMNI2_H0_MRG1HR, request 1 year of data in monthly chunks (to avoid timeout). Parse CSV response.
- **Daily update:** Call HAPI for the last 2 days (overlap for safety), upsert into `space_weather`.
- **Fill values:** OMNI uses 9999.99 or 999.9 as fill values for missing data. Convert these to NULL on insert.

### 9.2 Data Alignment

- All timestamps in UTC.
- Common time grid: 1-minute for real-time tables, 1-hour for materialized views.
- Short gaps (< 15 min): linear interpolation. Longer gaps: leave as NULL.
- Every record tagged with `source_id` and `raw_timestamp` (original source time).

---

## 10. Development Sessions

This section organizes development into 5 phases. Each phase is designed as one or more Claude Code sessions. For each phase: read the listed sections, ask the user the listed decision points, build the listed deliverables, and verify against the exit criteria before moving on.

### Phase 1 — Foundation

#### Read

Section 5 (Database Schema) — copy-paste SQL. Section 2.2 (NOAA endpoints) — URLs and JSON structure. Section 9.1 paragraph 'Pipeline for NOAA SWPC' — fetch/parse/insert steps. Section 9.1 paragraph 'Pipeline for Tomsk Images' — 7-step pixel extraction. Section 15.1 (Edge Function Inventory) — names and cron schedules for scrape-tomsk and poll-noaa-swpc. Section 15.2 (Project File Structure) — folder layout. Section 15.6 (Storage Buckets) — bucket names. Section 15.7 (Error Handling) — retry pattern.

#### Ask the User

Which Supabase plan? (Free vs Pro — affects connection limits and Edge Function invocations.) Confirm the project file structure from 15.2 or request changes. Confirm Edge Function names from 15.1. Confirm storage bucket names from 15.6.

#### Build

- Create Supabase project. Enable extensions: TimescaleDB, pg_cron, pg_net.
- Run the schema SQL from Section 5.1. Create hypertables. Run Section 5.2 (materialized view + cron refresh).
- Create Supabase Storage bucket (sr-spectrograms-raw).
- Build poll-noaa-swpc Edge Function: fetch 7 SWPC JSON endpoints, parse, upsert into space_weather. Apply error handling from 15.7.
- Build scrape-tomsk Edge Function: fetch sra.jpg, store raw image in bucket, extract pixel data using imagescript, insert into sr_readings. Start with amplitude image only.
- Register both Edge Functions in pg_cron with schedules from 15.1.
- Initialize Next.js project with folder structure from 15.2. Deploy empty shell to Vercel.

#### Done When

Supabase tables exist and have correct columns (verify with `\d sr_readings`). NOAA poller has run at least once and space_weather has rows. Tomsk scraper has run at least once and sr_readings has rows with source_id = 'tomsk'. Raw spectrogram image visible in Storage bucket. Next.js placeholder deploys to Vercel. pg_cron shows both functions scheduled.

### Phase 2 — Dark Cosmos Dashboard

#### Read

Section 4 (Visual Design System) — color palette hex values, fonts, ECharts theme config, spectrogram animation spec. Section 6.1 (Live Spectrogram) — ECharts heatmap implementation. Section 6.2 (Mode Tracker Panel) — 6-card layout with sparklines. Section 6.5 (Particle Flow) — Canvas 2D particle system. Section 6.9 ('What's Happening Now') — template-based summary card. Section 4.3 (Dashboard Layout) — 4-zone layout with react-resizable-panels. Section 15.3 (Zustand Store) — store interface. Section 3.2 (Frontend Stack) — library list.

#### Ask the User

Confirm Zustand store shape from 15.3 or modify. How many hours of live data to buffer in memory for the spectrogram waterfall? Should the particle system be enabled by default or hidden behind a toggle?

#### Build

- Implement Dark Cosmos theme: CSS custom properties from Section 4.1 palette, font imports (JetBrains Mono + Plus Jakarta Sans), global styles.
- Implement Zustand store from 15.3. Wire Supabase Realtime subscription (channel 'sr-live', table sr_readings, INSERT events) to update store.
- Build live spectrogram display (Section 6.1): ECharts heatmap with Dark Cosmos colormap, Realtime-driven updates, pulsing glow on newest column.
- Build mode tracker panel (Section 6.2): 6 cards, one per SR mode, with ECharts sparklines and value + unit display.
- Build background particle system (Section 6.5): Canvas 2D overlay reading currentAmplitude and currentKp from store.
- Build space weather overlay on time-series charts: Kp index as colored band.
- Build 'What's Happening Now' summary card (Section 6.9): template-based, physical units only.
- Assemble 4-zone dashboard layout (Section 4.3) with react-resizable-panels.

#### Done When

Dashboard loads with Dark Cosmos theme. Live spectrogram shows real data from Supabase and updates when new rows arrive. Mode tracker shows 6 cards with current values. Particle system animates in background. Summary card displays current conditions with correct units. Layout is resizable. All data displays physical units (pT, Hz, pT²/Hz), no interpretive language.

### Phase 3 — Historical Analysis + HeartMath

#### Read

Section 6.6 (Historical Trend Explorer) — date range picker, period comparison. Section 6.7 (Correlation Analysis) — scatter plot, multi-variable overlay. Section 2.1 'HeartMath GCI' subsection — spectrogram calendar URL, power chart XHR discovery. Section 9.1 'Pipeline for HeartMath' — both scraping strategies. Section 2.2 'CDAWeb HAPI' subsection — OMNI backfill. Section 9.1 'Pipeline for OMNI Historical Backfill' — chunk strategy, fill values. Section 5.2 (Materialized View) — sr_hourly_agg. Section 15.1 — Edge Functions scrape-heartmath, scrape-heartmath-power, backfill-omni. Section 15.5 (Data Retention) — volume estimates.

#### Ask the User

Should scrape-heartmath and scrape-heartmath-power be one function or two (15.1)? How far back to backfill OMNI data — 1 year or more? Keep raw HeartMath images indefinitely or per retention policy (15.5)? The HeartMath XHR endpoint must be discovered manually via DevTools — ask user to do this and provide the URL.

#### Build

- Build historical trend explorer (Section 6.6): DateRangePicker with presets, queries sr_hourly_agg.
- Build multi-variable overlay on historical charts (Section 6.7): toggle SR amplitude, Kp, Dst, solar wind. Dual Y-axes.
- Build correlation scatter plot (Section 6.7): any two variables, with lag offset control.
- Build scrape-heartmath Edge Function: fetch spectrogram calendar HTML, parse image URLs, fetch and store images, extract pixels.
- Build scrape-heartmath-power Edge Function: fetch the XHR endpoint (URL from user), parse JSON, upsert into sr_readings with mode_number = 0.
- Build backfill-omni Edge Function: CDAWeb HAPI call in monthly chunks, handle fill values (9999.99 → NULL), upsert into space_weather.
- Add CSV/JSON export via Next.js API route.
- Verify sr_hourly_agg refreshes correctly via pg_cron.

#### Done When

Historical charts load data across arbitrary date ranges. Multi-variable overlay works with at least SR amplitude + Kp. Scatter plot renders with lag control. HeartMath stations appear in the dashboard alongside Tomsk. OMNI backfill has populated space_weather with at least 6 months of historical data. Export downloads a CSV file.

### Phase 4 — Experience Layer

#### Read

Section 6.3 (3D Globe) — Three.js implementation with station markers and data ribbons. Section 6.4 (Sonification) — Tone.js engine, 220 Hz carrier, amplitude modulation, Kp-driven timbre. Section 6.8 (Anomaly Detection) — rolling baseline, thresholds, Q-burst detection. Section 4.2 (Spectrogram as Living Canvas) — pulse animation and ripple wave specs. Section 8.6 'This App's Stance' — design guidelines for labeling (no interpretive language). Section 3.2 (Frontend Stack) — Three.js, react-three-fiber, drei, Tone.js. Section 13 (Dependency List) — confirm all packages installed.

#### Ask the User

Should sonification auto-play on page load (browser will block this) or require explicit user activation? Globe: default camera position? Should anomaly detection run client-side from buffered data, or server-side in an Edge Function that writes to an anomalies table?

#### Build

- Build 3D globe (Section 6.3): react-three-fiber, Earth mesh, station markers at coordinates from STATIONS constant (Section 2.1), data ribbons showing amplitude by station.
- Build sonification engine (Section 6.4): Tone.js oscillator at 220 Hz, amplitude-modulated at SR fundamental frequency, Kp-driven low-pass filter. 'Enable Sound' button per browser autoplay policy.
- Add spectrogram pulse animation (Section 4.2): glow overlay on newest column, ripple on new data arrival.
- Build anomaly detection (Section 6.8): rolling 30-day baseline from sr_hourly_agg, 2σ/3σ thresholds, Q-burst detection (10× median), event log with DataTable.
- Build correlation scatter plot with lag analysis tools.
- Verify all experience layer elements use physical units and neutral labeling per Section 8.6.

#### Done When

Globe renders with station markers and rotates. Clicking a station selects it in the dashboard. Sonification plays audible tone that changes with live data. Spectrogram pulses on new data. Anomaly detection flags appear in event log and as visual markers on charts. Q-bursts detected and displayed distinctly. All labels use pT, Hz, pT²/Hz — no interpretive language.

### Phase 5 — Prediction + Polish

#### Read

Section 7 (Prediction Features) — diurnal envelope, seasonal baseline, space weather alerts, pattern matching. Section 7.3 (What to Avoid) — critical constraints. Section 2.1 'Cumiana' subsection — third station source. Section 11 (Risks and Mitigations) — full table. Section 15.5 (Data Retention) — implement the chosen policy. Section 15.7 (Error Handling) — verify all scrapers follow the pattern.

#### Ask the User

Add Cumiana as a third station now? Data retention: confirm policy from 15.5 decision. Should the app expose a public REST API for external tools (Jupyter, R)? Mobile: which panels to show/hide on small screens?

#### Build

- Implement expected diurnal envelope (Section 7.2): 30-day rolling average by hour-of-day, rendered as ECharts markArea shaded band.
- Add seasonal baseline overlay on historical charts.
- Build space weather impact alert banner: triggers when Kp > 5 from NOAA data. Particle system shifts to gold/orange.
- If confirmed: build scrape-cumiana Edge Function for Cumiana station.
- Implement data retention: scheduled DELETE from pg_cron per confirmed policy.
- Performance audit: test sr_hourly_agg query times with 6+ months of data. Profile ECharts rendering with large heatmap datasets. Fix bottlenecks.
- If confirmed: document REST API endpoints for external access.
- Mobile responsiveness: panels stack vertically, spectrogram always on top, globe becomes smaller, particle count reduces.
- Final review: verify all scrapers follow error pattern from 15.7. Verify all risks from Section 11 have been mitigated.

#### Done When

Diurnal envelope visible as shaded band on live chart. Space weather alert triggers correctly during elevated Kp. Dashboard renders correctly on mobile. All scrapers resilient to source outages. Data retention policy active. No performance issues with 6+ months of accumulated data.

---

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SR source URL changes | Broken scraper, data gaps | Multiple sources. Store raw images. Alert on errors. HeartMath is most stable. |
| Tomsk image URLs change | Primary image source lost | Monitor both sosrff.tsu.ru and sos70.ru. Use GeoCenter.info proxy as fallback. |
| Image parsing inaccuracy | Wrong amplitude/frequency | Validate against physical ranges. Cross-check stations. Periodic manual spot-checks. |
| Supabase TimescaleDB limits | Cannot use continuous aggregates | Use materialized views + pg_cron. Self-host TimescaleDB if data volume grows. |
| NOAA format change (March 31) | SWPC poller breaks | Monitor announcements. Schema-flexible JSON parsing. Test new formats early. |
| CDAWeb March 9 outage | OMNI backfill fails temporarily | Retry logic. Not urgent — OMNI is historical, daily updates can wait. |
| HeartMath XHR endpoint changes | Power data scraper breaks | Re-discover endpoint via DevTools. Spectrogram images (PHP page) are stable. |
| nocc.heartmath.org downtime | Both HM data channels offline | Fallback to nocc.glcoherence.org. Alert on source_health table errors. |
| ECharts WebGL perf on mobile | Spectrogram laggy on phones | Fall back to Canvas renderer on mobile. Reduce heatmap resolution for small screens. |
| Three.js bundle size | Slow initial page load | Dynamic import the globe component. Lazy-load Three.js only when globe panel is opened. |
| Browser autoplay policy | Sonification won't start | Require user click to enable audio. Show clear "Enable Sound" button. |

---

## 12. Why NASA CDAWeb Is Not the Primary SR Source

- **No dedicated SR data:** CDAWeb hosts satellite-based magnetospheric/solar wind data. While some datasets include ELF range observations (e.g., C/NOFS VEFI), these are not continuous ground-based SR monitoring feeds.
- **Archive latency:** Data typically appears hours to days after collection. Unacceptable for live SR monitoring.
- **Correct usage:** Use CDAWeb HAPI exclusively for the OMNI dataset (historical geomagnetic indices, solar wind) to backfill supplementary correlation tables.

> **Note:** Space-based SR detection does exist — China's CSES (Seismo-Electromagnetic Satellite, launched 2018) has successfully extracted the first two SR modes from orbital electric field data, and researchers have proposed using SR from orbit for earthquake precursor studies and planetary lightning detection. However, CSES data is archived at leos.ac.cn with research-access only, not suitable as a live monitoring feed. Ground-based stations remain the only viable real-time SR source.

---

## 13. Complete Dependency List

> **NEW IN v4.0 — AI-Dev Optimized:** Every dependency chosen for declarative APIs and strong TypeScript support, maximizing compatibility with Cursor and Claude Code.

| Package | Purpose | Why This One |
|---------|---------|--------------|
| next | Framework (App Router) | Industry standard, Vercel deployment |
| @supabase/supabase-js | Database client + Realtime | Direct PostgREST queries, WS subscriptions |
| echarts | All charts (heatmap, line, scatter, matrix) | One library. Declarative JSON config. WebGL. Streaming. |
| echarts-for-react | React wrapper for ECharts | Handles lifecycle, resize, props updates |
| three | 3D rendering (globe) | Industry standard WebGL |
| @react-three/fiber | React renderer for Three.js | JSX-based 3D — ideal for AI-assisted dev |
| @react-three/drei | Three.js helpers (Stars, OrbitControls) | Pre-built components, no boilerplate |
| tone | Web Audio / sonification | Musical abstractions, scheduling, synthesis |
| zustand | Global state (particle system, audio) | Tiny, no boilerplate, works outside React |
| framer-motion | Mount/unmount animations | Orchestrated staggered reveals |
| shadcn/ui | UI components (Cards, Calendar, Select) | Copy-paste components, full customization |
| react-resizable-panels | Dashboard panel layout | Drag-to-resize panels |
| date-fns | Date manipulation | Tree-shakeable, immutable |
| @tanstack/react-query | Server state + caching | Smart refetching, background updates |
| imagescript (Deno) | Image decoding in Edge Functions | Zero-dep TS + WASM, no native bindings, per-pixel RGB |

Install command:

```bash
npm install echarts echarts-for-react three @react-three/fiber @react-three/drei \
  tone zustand framer-motion react-resizable-panels date-fns @tanstack/react-query \
  @supabase/supabase-js
```

---

## 14. Summary

This application aggregates SR spectrogram data from public monitoring stations (Tomsk, HeartMath, Cumiana), enriches it with NASA/NOAA space weather data, and presents everything through an immersive Next.js dashboard backed by Supabase with TimescaleDB.

The v4.2 architecture is an experience-first design: a Dark Cosmos visual system with animated spectrograms, a 3D globe with live data ribbons, sonification that lets you hear the resonance, and a particle field that creates ambient awareness of electromagnetic conditions — all built on research-grade data accuracy.

The app provides live monitoring, historical exploration across arbitrary date ranges, correlation analysis, anomaly detection, and scientifically grounded prediction features. Every visualization serves two audiences simultaneously: researchers see precision, explorers feel understanding.

The data is presented neutrally and accurately. The app does not editorialize. The tools are open-ended. The experience layers (sound, particles, glow) make the data viscerally accessible without imposing interpretation.

The biggest technical challenge: extracting structured data from spectrogram images. The biggest operational risk: source instability. Both are mitigated by multi-source redundancy, validation checks, and a pipeline that degrades gracefully when any single source goes offline.

Before writing code, review Section 15 (Implementation Decisions). It consolidates open architectural choices — Edge Function naming, project structure, store shape, polling cadence, data retention, storage buckets, and error handling — that should be confirmed with the project owner rather than assumed.

> The biggest design challenge: serving scientists and seekers with one interface. The answer: beauty IS the data. Precision IS wonder. They are not in conflict.

---

## 15. Implementation Decisions (Open)

The following areas require decisions before or during implementation. Each has a sensible default but the final choice depends on hosting tier, budget, and user preferences. An AI coding agent should ask the user to confirm or override these before proceeding.

### 15.1 Edge Function Inventory

The app needs at minimum 5 Edge Functions. Confirm naming, schedule, and whether any should be merged:

| Function | Task | Frequency | Cron |
|----------|------|-----------|------|
| scrape-tomsk | Fetch + extract 4 Tomsk images | Every 15 min | `*/15 * * * *` |
| scrape-heartmath | Fetch spectrogram calendar + images | Every 60 min | `0 * * * *` |
| scrape-heartmath-power | Fetch Highcharts XHR power data | Every 60 min | `5 * * * *` |
| poll-noaa-swpc | Fetch all 7 SWPC JSON endpoints | Every 5 min | `*/5 * * * *` |
| backfill-omni | CDAWeb HAPI historical import | Daily at 03:00 | `0 3 * * *` |

**Decision points:** Should scrape-heartmath and scrape-heartmath-power be one function? Add scrape-cumiana as a 6th function? What Supabase plan tier — Free (500K Edge Function invocations/month) or Pro?

### 15.2 Project File Structure

Suggested layout for a Next.js App Router + Supabase Edge Functions project. Adjust based on preference:

```
/app                      Next.js App Router pages
  /app/(dashboard)         Main dashboard layout
  /app/api/                API routes (export, admin triggers)
/components                React components
  /components/charts        ECharts wrappers (spectrogram, line, scatter)
  /components/globe         Three.js globe + data ribbons
  /components/audio         Tone.js sonification engine
  /components/particles     Canvas 2D particle system
  /components/ui             shadcn/ui components
/lib                       Shared utilities
  /lib/supabase.ts          Client initialization
  /lib/store.ts             Zustand global store
  /lib/constants.ts         STATIONS, COLORS, MODE_FREQUENCIES
  /lib/types.ts             TypeScript interfaces
/supabase
  /supabase/functions        Edge Functions (one folder per function)
  /supabase/migrations       SQL migration files
```

**Decision points:** Monorepo or separate repos for frontend and functions? Use Turborepo? Place constants in a shared package?

### 15.3 Zustand Store Shape

The particle system, sonification engine, and multiple UI components read from a shared global store. Minimum shape:

```typescript
interface AppStore {
  // Live data (updated via Supabase Realtime)
  latestReading: SrReading | null;
  latestWeather: SpaceWeather | null;
  sourceHealth: Record<string, SourceStatus>;

  // Derived state (computed from latest data)
  currentAmplitude: number;     // drives particle count + glow intensity
  currentKp: number;            // drives particle color + sonification timbre
  anomalyActive: boolean;       // drives red glow

  // UI state
  audioEnabled: boolean;
  selectedStation: string;
  dateRange: [Date, Date];
  visibleModes: number[];       // which of the 6 modes are shown
}
```

**Decision points:** Should the store hold historical data arrays, or should components fetch their own via react-query? How many readings to buffer in memory for the live spectrogram waterfall (last 1 hour? 4 hours? 24 hours)?

### 15.4 Scraping Frequency Summary

| Source | Update frequency at source | Recommended poll | Rationale |
|--------|---------------------------|-----------------|-----------|
| Tomsk images | ~15 min | Every 15 min | Matches source cadence |
| HeartMath spectrograms | Daily (one image per day) | Every 60 min | Check for new day's image |
| HeartMath power chart | Hourly | Every 60 min | Matches source cadence |
| NOAA SWPC (7 endpoints) | 1 min to 3 hours | Every 5 min | Fast-moving data (Kp, Bz) |
| OMNI CDAWeb | Historical archive | Daily at 03:00 | Backfill only, not live |
| Cumiana (Phase 5) | ~30 min | Every 30 min | Matches source cadence |

**Decision points:** Should NOAA endpoints be polled individually or all in one function call? Should Tomsk poll frequency increase during geomagnetic storms (adaptive polling)?

### 15.5 Data Retention

Raw data volume estimates (1 year):

| Table | Estimate |
|-------|----------|
| sr_readings | ~6 readings/hour × 8 sources × 6 modes = ~288 rows/hour ≈ 2.5M rows/year |
| space_weather | ~12 rows/hour (NOAA) + 24 rows/day (OMNI) ≈ 105K rows/year |
| sr_spectrograms | ~4 images/hour × 8 sources ≈ 280K rows/year |
| Raw images | ~4 KB per image × 280K ≈ 1.1 GB/year in Supabase Storage |

**Decision points:** Keep raw sr_readings indefinitely (small enough) or roll off after 2 years? Keep raw images for 90 days then delete (keeping only extracted data)? Archive older data to a cheaper store?

### 15.6 Supabase Storage Buckets

| Bucket name | Content | Access | Retention |
|-------------|---------|--------|-----------|
| sr-spectrograms-raw | Original images from sources | Private | Per 15.5 |
| sr-exports | User-generated CSV/JSON | Private | 30 days |

**Decision points:** Make raw spectrograms publicly readable (users can inspect original images) or private (only backend)? Add a third bucket for user uploads if the app later supports personal data?

### 15.7 Error Handling and Retry

General pattern for all scraper Edge Functions:

- **On HTTP error (4xx/5xx) or timeout:** Log to source_health table with error message and timestamp. Do not retry within the same invocation — let the next scheduled run retry naturally.
- **On 3 consecutive failures for any source:** Set `source_health.status = 'degraded'`. Frontend shows yellow indicator in Status Zone.
- **On 24 hours of continuous failure:** Set `source_health.status = 'offline'`. Frontend shows red indicator. No alert to user unless they opt in.
- **On parse error (image pixel extraction fails validation):** Store the raw image anyway (for debugging). Log as 'parse_error' in source_health. Skip insertion into sr_readings.
- **NOAA rate-limit (429):** Back off to 1 request per endpoint per 10 minutes for 1 hour, then resume normal cadence.

**Decision points:** Should the app send admin email/webhook notifications on source outage? Should there be a manual 'retry now' button in the admin panel? How to handle the Tomsk site being completely offline for days (show cached data or blank)?
