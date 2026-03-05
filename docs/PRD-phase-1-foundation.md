# PRD Phase 1 — Foundation (Database + Scrapers + Project Init)

## Confirmed Decisions

- **Supabase tier:** Free (500K Edge Function invocations/month, 500MB DB)
- **Supabase project:** Not yet created — part of this phase
- **Repo structure:** Single monorepo, Next.js in project root
- **Package manager:** npm
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Local only — Vercel deployment deferred
- **Data retention:** Images 90 days, numerical data forever

---

## 1.1 Goals & Deliverables

At the end of Phase 1, the following must be working:

1. **Supabase project** exists on Free tier with Postgres 15 or 16 (NOT 17 — TimescaleDB deprecated on 17)
2. **Database schema deployed:** 4 tables (`sr_readings`, `space_weather`, `sr_spectrograms`, `source_health`) + materialized view `sr_hourly_agg` + RLS policies
3. **Storage bucket** `sr-spectrograms-raw` created (private)
4. **`poll-noaa-swpc` Edge Function** deployed, fetching all 7 SWPC JSON endpoints every 5 min
5. **`scrape-tomsk` Edge Function** deployed, fetching Tomsk images every 15 min, storing raw images, extracting pixel data into `sr_readings`
6. **Next.js project initialized** with App Router, Tailwind, shadcn/ui — placeholder page at localhost:3000
7. **pg_cron schedules** registered for both Edge Functions + materialized view refresh
8. **End-to-end verification:** placeholder page displays live data from the database

---

## 1.2 Prerequisites (User Must Have)

- Supabase account (free)
- Node.js 18+ and npm installed
- Supabase CLI installed (`npm install -g supabase`)
- Internet access

---

## 1.3 User Action Items (Manual Steps)

### UA-1.1: Create Supabase Project
1. Go to https://supabase.com/dashboard → "New Project"
2. **CRITICAL:** Select Postgres version **15 or 16** (NOT 17 — TimescaleDB is deprecated on 17)
3. Choose region closest to you
4. Set a strong database password (save it)
5. Wait ~2 min for provisioning
6. Record: Project URL (`https://<ref>.supabase.co`), anon key, service_role key

### UA-1.2: Enable Extensions
1. Go to Database → Extensions in Supabase dashboard
2. Enable: `timescaledb`, `pg_cron`, `pg_net`
3. Note: these must be enabled via dashboard on Free tier

### UA-1.3: Link Supabase CLI
```bash
supabase login
supabase link --project-ref <your-project-ref>
```

### UA-1.4: Create `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

---

## 1.4 Detailed Tasks (Ordered)

### Task 1.1: Initialize Next.js Project ✅

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Install dependencies:
```bash
npm install @supabase/supabase-js @supabase/ssr zustand date-fns @tanstack/react-query
npm install echarts echarts-for-react react-resizable-panels framer-motion
npx shadcn@latest init  # New York style, Zinc base, CSS variables = yes
```

Create directory structure:
```
src/
  app/
    (dashboard)/
      layout.tsx
      page.tsx
    api/
  components/
    charts/
    ui/           (shadcn components)
    particles/
  lib/
    supabase.ts
    store.ts
    constants.ts
    types.ts
supabase/
  functions/
    poll-noaa-swpc/
      index.ts
    scrape-tomsk/
      index.ts
  migrations/
    001_initial_schema.sql
```

**Blocked by:** Nothing (first task)

---

### Task 1.2: Create Supabase Client Utility ✅

**File:** `src/lib/supabase.ts`

- Browser client using `createBrowserClient` from `@supabase/ssr`
- Server client using service_role key for API routes
- Export both

**Blocked by:** Task 1.1, UA-1.4

---

### Task 1.3: Define TypeScript Types ✅

**File:** `src/lib/types.ts`

Interfaces mirroring database schema:
- `SrReading` — columns from `sr_readings`
- `SpaceWeather` — columns from `space_weather`
- `SrSpectrogram` — columns from `sr_spectrograms`
- `SourceHealth` — columns from `source_health`
- `HourlyAgg` — columns from `sr_hourly_agg` materialized view

**Blocked by:** Task 1.1

---

### Task 1.4: Define Constants ✅

**File:** `src/lib/constants.ts`

- `STATIONS` object from blueprint Section 2.1 (all 8 stations with lat/lon/color)
- `MODE_FREQUENCIES`: `[7.83, 14.3, 20.8, 27.3, 33.8, 39.0]`
- `MODE_LABELS`: `['Mode 1 (7.83 Hz)', ...]`
- NOAA endpoint URLs (all 7 from blueprint Section 2.2)
- Tomsk image URLs (4 URLs from blueprint Section 2.1)

**Blocked by:** Task 1.1

---

### Task 1.5: Write Database Migration SQL

**File:** `supabase/migrations/001_initial_schema.sql`

From blueprint Section 5.1:

```sql
-- Extensions (must be enabled via dashboard first)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- sr_readings: time-series SR data
CREATE TABLE sr_readings (
  time        TIMESTAMPTZ NOT NULL,
  source_id   TEXT        NOT NULL,   -- 'tomsk', 'heartmath_gci001', etc.
  mode_number SMALLINT    NOT NULL,   -- 1-6 (individual modes), 0 (total power)
  frequency_hz DOUBLE PRECISION,
  amplitude_pt DOUBLE PRECISION,
  q_factor     DOUBLE PRECISION,
  power_density DOUBLE PRECISION,     -- pT²/Hz
  raw_timestamp TEXT,                  -- original source timestamp (audit)
  PRIMARY KEY (time, source_id, mode_number)
);
SELECT create_hypertable('sr_readings', 'time');

-- space_weather: NOAA/OMNI geomagnetic data
CREATE TABLE space_weather (
  time            TIMESTAMPTZ PRIMARY KEY,
  kp_index        DOUBLE PRECISION,
  dst_index       DOUBLE PRECISION,
  bz_component    DOUBLE PRECISION,
  solar_wind_speed DOUBLE PRECISION,
  proton_density  DOUBLE PRECISION,
  ae_index        DOUBLE PRECISION,
  f10_index       DOUBLE PRECISION,
  flare_class     TEXT
);
SELECT create_hypertable('space_weather', 'time');

-- sr_spectrograms: metadata for raw images
CREATE TABLE sr_spectrograms (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  time       TIMESTAMPTZ NOT NULL,
  source_id  TEXT        NOT NULL,
  image_type TEXT        NOT NULL,   -- 'amplitude', 'frequency', 'spectrogram', 'qfactor'
  image_path TEXT        NOT NULL,   -- path in sr-spectrograms-raw bucket
  processed  BOOLEAN     DEFAULT FALSE
);

-- source_health: scraper monitoring
CREATE TABLE source_health (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  time          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_id     TEXT        NOT NULL,
  status        TEXT        NOT NULL,  -- 'ok', 'error', 'degraded', 'offline', 'parse_error', 'rate_limited'
  latency_ms    INTEGER,
  error_message TEXT,
  rows_inserted INTEGER     DEFAULT 0
);

-- Indexes
CREATE INDEX idx_sr_source_time ON sr_readings (source_id, time DESC);
CREATE INDEX idx_spectro_source ON sr_spectrograms (source_id, time DESC);
CREATE INDEX idx_health_source ON source_health (source_id, time DESC);

-- Materialized view: hourly aggregates
CREATE MATERIALIZED VIEW sr_hourly_agg AS
SELECT
  time_bucket('1 hour', time) AS bucket,
  source_id,
  mode_number,
  AVG(frequency_hz) AS avg_freq,
  AVG(amplitude_pt) AS avg_amp,
  MAX(amplitude_pt) AS max_amp,
  MIN(amplitude_pt) AS min_amp,
  STDDEV(amplitude_pt) AS stddev_amplitude,
  COUNT(*) AS sample_count
FROM sr_readings
GROUP BY bucket, source_id, mode_number;

CREATE UNIQUE INDEX idx_hourly_agg ON sr_hourly_agg (bucket, source_id, mode_number);

-- pg_cron: refresh materialized view hourly
SELECT cron.schedule('refresh-sr-agg', '0 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY sr_hourly_agg$$);

-- RLS policies
ALTER TABLE sr_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_weather ENABLE ROW LEVEL SECURITY;
ALTER TABLE sr_spectrograms ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sr_readings" ON sr_readings FOR SELECT TO anon USING (true);
CREATE POLICY "Public read space_weather" ON space_weather FOR SELECT TO anon USING (true);
CREATE POLICY "Public read sr_spectrograms" ON sr_spectrograms FOR SELECT TO anon USING (true);
CREATE POLICY "Public read source_health" ON source_health FOR SELECT TO anon USING (true);

CREATE POLICY "Service write sr_readings" ON sr_readings FOR ALL TO service_role USING (true);
CREATE POLICY "Service write space_weather" ON space_weather FOR ALL TO service_role USING (true);
CREATE POLICY "Service write sr_spectrograms" ON sr_spectrograms FOR ALL TO service_role USING (true);
CREATE POLICY "Service write source_health" ON source_health FOR ALL TO service_role USING (true);
```

**Blocked by:** Task 1.1
**Depends on:** UA-1.2 (extensions enabled first)

---

### Task 1.6: Run Database Migration

```bash
supabase db push
```

Verify:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
SELECT * FROM timescaledb_information.hypertables;
```

**Blocked by:** Task 1.5, UA-1.1, UA-1.2, UA-1.3

---

### Task 1.7: Create Storage Bucket

Via Supabase SQL Editor or dashboard:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('sr-spectrograms-raw', 'sr-spectrograms-raw', false);
```

**Blocked by:** UA-1.1

---

### Task 1.8: Build `poll-noaa-swpc` Edge Function

**File:** `supabase/functions/poll-noaa-swpc/index.ts`

Deno Edge Function that:
1. Fetches all 7 NOAA SWPC endpoints (blueprint Section 2.2):
   - `/products/noaa-planetary-k-index-forecast.json` → `kp_index`
   - `/json/planetary_k_index_1m.json` → `kp_index` (1-min)
   - `/products/kyoto-dst.json` → `dst_index`
   - `/products/solar-wind/mag-1-day.json` → `bz_component`
   - `/products/solar-wind/plasma-1-day.json` → `solar_wind_speed`, `proton_density`
   - `/products/alerts.json` → log only
   - `/json/goes/primary/xrays-1-day.json` → `flare_class`
2. Parses each JSON response (each has different format)
3. Upserts into `space_weather` using `ON CONFLICT (time) DO UPDATE`
4. Logs to `source_health` (status, latency_ms, error_message, rows_inserted)
5. 500ms delay between requests to avoid hammering NOAA
6. Defensive parsing — NOAA format changing March 31, 2026

Error handling per blueprint Section 15.7:
- HTTP error/timeout: log, don't retry, let next cron handle it
- 429 rate limit: log as 'rate_limited', back off mentally

**Blocked by:** Task 1.6

---

### Task 1.9: Build `scrape-tomsk` Edge Function

**File:** `supabase/functions/scrape-tomsk/index.ts`

Deno Edge Function that:
1. Fetches Tomsk images:
   - `https://sosrff.tsu.ru/new/sra.jpg` (amplitude — PRIMARY)
   - `https://sosrff.tsu.ru/new/srf.jpg` (frequency — PRIMARY)
   - `https://sosrff.tsu.ru/new/shm.jpg` (3-day spectrogram — SECONDARY, can skip Phase 1)
   - `https://sosrff.tsu.ru/new/srq.jpg` (Q-factor — SECONDARY, can skip Phase 1)
2. Stores raw images in `sr-spectrograms-raw` bucket: `tomsk/{type}/{YYYY-MM-DD_HH-mm}.jpg`
3. Logs entry in `sr_spectrograms` table
4. Processes `sra.jpg` using `imagescript`:
   - Decode JPEG to pixel array
   - Crop to plot area (pixel boundaries need initial calibration — document process)
   - X-axis → time: 24h span in Krasnoyarsk Time (UTC+7, no DST)
   - Y-axis → frequency: linear, 0-40 Hz
   - For each of 6 SR modes (~7.83, ~14.3, ~20.8, ~27.3, ~33.8, ~39.0 Hz):
     - Sample horizontal stripe +/- 1 Hz
     - Find peak pixel value
     - Map Tomsk colormap (white=max, green=moderate, blue=low, black=no data) to amplitude
   - Validate: reject if frequency > 50 Hz or amplitude > 100 pT
   - Insert into `sr_readings`: one row per mode, source_id='tomsk'
5. Process `srf.jpg` similarly for actual peak frequencies
6. Log to `source_health`
7. Fallback: if `sosrff.tsu.ru` fails, try `sos70.ru`

**Pixel calibration process (document in code comments):**
1. Download `sra.jpg` manually
2. Open in image editor, note pixel coordinates of plot area corners
3. Note frequency axis range and time axis range
4. Hardcode as constants — update when Tomsk changes their layout

**Colormap mapping:**
- White (255,255,255) = maximum power
- Green channel dominant = moderate
- Blue channel dominant = low
- Black (0,0,0) = no data → return NULL

**Blocked by:** Task 1.6, Task 1.7

---

### Task 1.10: Register pg_cron Schedules

Run in Supabase SQL Editor:
```sql
SELECT cron.schedule(
  'poll-noaa-swpc', '*/5 * * * *',
  $$SELECT net.http_post(
    url := '<SUPABASE_URL>/functions/v1/poll-noaa-swpc',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>'),
    body := '{}'::jsonb
  )$$
);

SELECT cron.schedule(
  'scrape-tomsk', '*/15 * * * *',
  $$SELECT net.http_post(
    url := '<SUPABASE_URL>/functions/v1/scrape-tomsk',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>'),
    body := '{}'::jsonb
  )$$
);
```
Replace `<SUPABASE_URL>` and `<SERVICE_ROLE_KEY>` with actual values.

**Blocked by:** Task 1.11

---

### Task 1.11: Deploy Edge Functions

```bash
supabase functions deploy poll-noaa-swpc
supabase functions deploy scrape-tomsk
supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
```

Test manually:
```bash
supabase functions invoke poll-noaa-swpc
supabase functions invoke scrape-tomsk
```

**Blocked by:** Task 1.8, Task 1.9, UA-1.3

---

### Task 1.12: Placeholder Dashboard Page

**File:** `src/app/(dashboard)/page.tsx`

Minimal page that:
- Connects to Supabase
- Fetches latest 5 rows from `sr_readings` → simple table
- Fetches latest row from `space_weather` → shows Kp value
- Shows `source_health` status
- Purpose: verify full pipeline works end-to-end

**Blocked by:** Task 1.1, Task 1.2, Task 1.6

---

## 1.5 Free Tier Budget

| Function | Frequency | Monthly Invocations |
|----------|-----------|-------------------|
| poll-noaa-swpc | */5 min | 8,640 |
| scrape-tomsk | */15 min | 2,880 |
| **Phase 1 Total** | | **11,520 (2.3% of 500K)** |

Database size Year 1: ~260 MB of 500 MB limit.

---

## 1.6 Exit Criteria

| Criterion | Verification |
|-----------|-------------|
| Tables exist | `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';` |
| Hypertables configured | `SELECT * FROM timescaledb_information.hypertables;` |
| NOAA data flowing | `SELECT COUNT(*) FROM space_weather;` > 0 |
| Tomsk data flowing | `SELECT COUNT(*) FROM sr_readings WHERE source_id = 'tomsk';` > 0 |
| Raw images stored | Check `sr-spectrograms-raw` bucket in dashboard |
| pg_cron active | `SELECT * FROM cron.job;` shows both jobs |
| Materialized view | `SELECT COUNT(*) FROM sr_hourly_agg;` runs without error |
| Next.js loads | `npm run dev` → localhost:3000 shows placeholder |
| Supabase connected | Placeholder page displays live data |
| RLS active | `SELECT * FROM pg_policies;` shows SELECT policies |

---

## 1.7 Dependency Graph

```
UA-1.1 (Create Supabase)
  ├── UA-1.2 (Enable extensions)
  │     └── Task 1.5 (Migration SQL)
  │           └── Task 1.6 (Run migration)
  │                 ├── Task 1.8 (poll-noaa-swpc)
  │                 └── Task 1.9 (scrape-tomsk)
  │                       └── Task 1.11 (Deploy functions)
  │                             └── Task 1.10 (pg_cron)
  ├── UA-1.3 (Link CLI) ──── Task 1.11
  ├── UA-1.4 (.env.local) ── Task 1.2 (Supabase client)
  └── Task 1.7 (Storage bucket) ── Task 1.9

Task 1.1 (Init Next.js) ── Task 1.2, 1.3, 1.4, 1.5, 1.12
```
