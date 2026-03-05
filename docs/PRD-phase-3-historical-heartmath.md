# PRD Phase 3 — Historical Analysis + HeartMath

## 3.1 Goals & Deliverables

At the end of Phase 3, the following must be working:

1. **Historical trend explorer** — date range picker with presets, queries `sr_hourly_agg`, ECharts line chart
2. **Multi-variable overlay** — toggle SR amplitude, Kp, Dst, solar wind on same chart with dual Y-axes
3. **Correlation scatter plot** — any two variables with lag offset control (0-72h)
4. **`scrape-heartmath` Edge Function** — fetches spectrogram calendar HTML, parses image URLs, stores images, extracts pixel data for 6 GCI stations
5. **`scrape-heartmath-power` Edge Function** — fetches XHR power data endpoint, parses JSON, upserts into `sr_readings` with mode_number=0
6. **`backfill-omni` Edge Function** — CDAWeb HAPI historical import in monthly chunks
7. **CSV/JSON export** via Next.js API route
8. **HeartMath stations visible** in dashboard alongside Tomsk
9. **OMNI backfill** populates `space_weather` with 6+ months of historical data

---

## 3.2 Prerequisites

- Phase 2 fully complete (all exit criteria met)
- Dashboard rendering live Tomsk data with spectrogram, mode cards, particles
- User has completed HeartMath XHR endpoint discovery (UA-3.1 below)

---

## 3.3 User Action Items

### UA-3.1: Discover HeartMath Power Chart XHR Endpoint

**Step-by-step guide:**

1. Open Chrome/Edge browser
2. Navigate to: `https://nocc.heartmath.org/power_levels/public/charts/power_levels.html`
3. Open DevTools (F12 or Cmd+Option+I)
4. Go to **Network** tab
5. Filter by **XHR/Fetch**
6. Reload the page
7. Look for requests that return JSON data with power level values
8. The request likely looks like: `https://nocc.heartmath.org/power_levels/...` or similar
9. Right-click the request → Copy → Copy as cURL
10. Test the cURL in terminal to confirm it returns JSON
11. Note:
    - The full URL (including any query parameters)
    - The response JSON structure (keys, data format)
    - Any required headers (cookies, auth tokens)
12. Provide this URL and response format for the Edge Function implementation

**What to look for in the response:**
- Array of objects with timestamps and power values
- Likely one entry per station (GCI001-GCI006)
- Power values represent sum of 0.32-36 Hz band
- 24-hour moving average values

### UA-3.2: Confirm HeartMath Spectrogram Calendar URL

Verify this URL is still active:
- `https://nocc.heartmath.org/spectrogram/index.php?d=YYYY-MM-DD`
- This is a PHP-rendered page with links to daily spectrogram images
- Check that image URLs follow a predictable pattern (date-based)

### UA-3.3: Confirm OMNI Backfill Range

How far back should we backfill historical space weather data?
- Recommended: 2 years (provides good seasonal baseline)
- Minimum: 6 months
- CDAWeb HAPI endpoint: `https://cdaweb.gsfc.nasa.gov/hapi`
- Dataset: OMNI2_H0_MRG1HR (hourly merged data)

---

## 3.4 Detailed Tasks (Ordered)

### Task 3.1: Historical Trend Explorer

**File:** `src/components/charts/historical-explorer.tsx`

ECharts line chart with:
- Date range picker: shadcn Calendar + Popover
- Presets: Last 24h, 7d, 30d, 90d, 1y, Custom
- Data source: `sr_hourly_agg` for ranges > 24h, raw `sr_readings` for <= 24h
- X-axis: time
- Y-axis: amplitude (pT) or frequency (Hz) — toggle
- Multiple series: one per station (colored per `STATIONS` constant)
- Mode selector: checkboxes to show/hide individual modes (1-6)
- Zoom: ECharts dataZoom (slider + inside scroll)
- Loading state: skeleton shimmer while fetching

**File:** `src/lib/queries.ts` (extend)
- `fetchHistoricalData(startTime, endTime, sourceIds, modes)` — query `sr_hourly_agg`

**Blocked by:** Nothing (can start immediately, builds on Phase 2 infrastructure)

---

### Task 3.2: Multi-Variable Overlay

**File:** `src/components/charts/multi-variable-chart.tsx`

Extension of historical explorer:
- Toggle buttons: SR Amplitude, Kp, Dst, Solar Wind Speed, Bz
- Dual Y-axes: left for SR (pT), right for space weather index
- Each variable as separate ECharts series with own color
- Synchronized tooltip showing all values at cursor time
- Space weather data from `space_weather` table, aligned by time

**Blocked by:** Task 3.1

---

### Task 3.3: Correlation Scatter Plot

**File:** `src/components/charts/correlation-scatter.tsx`

ECharts scatter plot:
- X variable selector: dropdown (SR Amplitude Mode 1-6, Kp, Dst, Bz, Solar Wind)
- Y variable selector: same options
- Lag offset slider: 0-72 hours (shifts Y relative to X)
- Point color: by time (gradient from old=dim to recent=bright)
- Regression line overlay (simple linear fit)
- Pearson correlation coefficient displayed
- Data source: join `sr_hourly_agg` with `space_weather` on time bucket

**File:** `src/lib/correlation.ts`
- `calculateCorrelation(x, y)` — Pearson r
- `applyLag(data, lagHours)` — shift one array by N hours
- `linearRegression(x, y)` — slope, intercept, r²

**Blocked by:** Task 3.1

---

### Task 3.4: Build `scrape-heartmath` Edge Function

**File:** `supabase/functions/scrape-heartmath/index.ts`

Deno Edge Function that:
1. Fetches spectrogram calendar page: `https://nocc.heartmath.org/spectrogram/index.php?d=YYYY-MM-DD`
2. Parses HTML (plain PHP-rendered, no JS required):
   - Find image links/URLs for each station's daily spectrogram
   - Extract date from URL pattern
3. For each new image (not already in `sr_spectrograms`):
   a. Fetch image bytes
   b. Store in `sr-spectrograms-raw` bucket: `heartmath/{station_id}/{YYYY-MM-DD}.png`
   c. Log in `sr_spectrograms` table
4. Process images with `imagescript`:
   - Decode PNG to pixel array
   - HeartMath spectrograms: X=time (24h), Y=frequency (1-50 Hz), Color=power
   - Extract per-mode data for modes 1-6 at expected frequencies
   - Insert into `sr_readings` with source_id='heartmath_gci001' through 'heartmath_gci006'
5. Log to `source_health`
6. Fallback URL: `https://nocc.glcoherence.org/en/gcms/spectrogram`

Schedule: `0 * * * *` (hourly)

**Blocked by:** UA-3.2, Phase 1 infrastructure

---

### Task 3.5: Build `scrape-heartmath-power` Edge Function

**File:** `supabase/functions/scrape-heartmath-power/index.ts`

Deno Edge Function that:
1. Fetches the XHR endpoint discovered in UA-3.1
2. Parses JSON response:
   - Extract power values per station
   - Map station identifiers to our source_ids (heartmath_gci001-006)
   - Timestamps: convert to UTC if needed
3. Upsert into `sr_readings`:
   - `mode_number = 0` (total power, not per-mode)
   - `amplitude_pt` = total power value
   - `frequency_hz` = NULL (not applicable for total power)
4. Log to `source_health`
5. Handle: missing stations (some may be offline), changed response format

Schedule: `5 * * * *` (hourly, offset 5 min from spectrogram scraper)

**Blocked by:** UA-3.1 (XHR endpoint URL required)

---

### Task 3.6: Build `backfill-omni` Edge Function

**File:** `supabase/functions/backfill-omni/index.ts`

Deno Edge Function that:
1. Calls CDAWeb HAPI endpoint:
   ```
   GET https://cdaweb.gsfc.nasa.gov/hapi/data
     ?id=OMNI2_H0_MRG1HR
     &parameters=KP1800,DST1800,flow_speed,proton_density,BZ_GSE,AE_INDEX,F10_INDEX
     &time.min=<start>&time.max=<end>
     &format=json
   ```
2. Processes in monthly chunks to avoid timeout:
   - Track last backfilled month in a simple state mechanism (e.g., check max time in `space_weather` for source='omni')
   - Each invocation processes one month, advances to next
3. Parses HAPI JSON response:
   - Handle fill values: 9999.99 → NULL, 99.99 → NULL
   - Map parameters: KP1800→kp_index, DST1800→dst_index, flow_speed→solar_wind_speed, proton_density→proton_density, BZ_GSE→bz_component, AE_INDEX→ae_index, F10_INDEX→f10_index
4. Upserts into `space_weather` (ON CONFLICT DO UPDATE)
5. Logs to `source_health`

Schedule: `0 3 * * *` (daily at 3 AM)

**Note:** CDAWeb had a planned outage around March 9, 2026. Retry logic: if fetch fails, log and try again next day.

**Blocked by:** UA-3.3, Phase 1 infrastructure

---

### Task 3.7: CSV/JSON Export API Route

**File:** `src/app/api/export/route.ts`

Next.js API route:
- Query params: `format` (csv|json), `start`, `end`, `source_ids`, `modes`, `table` (sr_readings|space_weather)
- Fetches from `sr_hourly_agg` or raw tables based on range
- Streams response with appropriate Content-Type and Content-Disposition headers
- CSV: header row + data rows
- JSON: array of objects
- Rate limit: max 1 export per minute per IP (simple in-memory counter)

**Blocked by:** Phase 1 Task 1.2

---

### Task 3.8: Register New pg_cron Schedules

```sql
SELECT cron.schedule(
  'scrape-heartmath', '0 * * * *',
  $$SELECT net.http_post(
    url := '<SUPABASE_URL>/functions/v1/scrape-heartmath',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>'),
    body := '{}'::jsonb
  )$$
);

SELECT cron.schedule(
  'scrape-heartmath-power', '5 * * * *',
  $$SELECT net.http_post(
    url := '<SUPABASE_URL>/functions/v1/scrape-heartmath-power',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>'),
    body := '{}'::jsonb
  )$$
);

SELECT cron.schedule(
  'backfill-omni', '0 3 * * *',
  $$SELECT net.http_post(
    url := '<SUPABASE_URL>/functions/v1/backfill-omni',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>'),
    body := '{}'::jsonb
  )$$
);
```

**Blocked by:** Tasks 3.4, 3.5, 3.6 deployed

---

### Task 3.9: Update Dashboard for HeartMath Stations

**Modifications:**
- Station selector in spectrogram: add HeartMath stations (GCI001-006)
- Mode tracker: allow switching between stations
- Summary card: include HeartMath status
- Source health display: show all active sources

**Blocked by:** Task 3.4 (HeartMath data must be flowing)

---

### Task 3.10: Integrate Historical + Correlation into Dashboard

**File:** `src/app/(dashboard)/page.tsx` (modify)

- Replace placeholder in Analysis Zone with historical explorer
- Replace placeholder in Correlation Zone with scatter plot
- Add navigation tabs: "Live" | "Historical" | "Correlation"
- Ensure date range picker syncs across views

**Blocked by:** Tasks 3.1, 3.2, 3.3, 3.9

---

## 3.5 Updated Free Tier Budget

| Function | Frequency | Monthly Invocations |
|----------|-----------|-------------------|
| poll-noaa-swpc | */5 min | 8,640 |
| scrape-tomsk | */15 min | 2,880 |
| scrape-heartmath | hourly | 720 |
| scrape-heartmath-power | hourly | 720 |
| backfill-omni | daily | 30 |
| **Total** | | **12,990 (2.6% of 500K)** |

Still well within Free tier limits.

---

## 3.6 Exit Criteria

| Criterion | Verification |
|-----------|-------------|
| Historical chart loads | Select "Last 30 days" → line chart renders with data |
| Date range works | Custom date range returns correct time span |
| Multi-variable overlay | Toggle Kp + SR Amplitude → both visible with dual axes |
| Correlation scatter | Select SR Amp vs Kp → scatter plot renders, shows r value |
| Lag control works | Slide lag to 6h → points shift, r value changes |
| HeartMath spectrogram data | `SELECT COUNT(*) FROM sr_readings WHERE source_id LIKE 'heartmath%';` > 0 |
| HeartMath power data | `SELECT COUNT(*) FROM sr_readings WHERE source_id LIKE 'heartmath%' AND mode_number = 0;` > 0 |
| OMNI backfill | `SELECT MIN(time), MAX(time) FROM space_weather;` shows 6+ months range |
| CSV export | Download CSV via `/api/export?format=csv&start=...&end=...` → valid file |
| JSON export | Same with `format=json` → valid JSON array |
| Station selector | Can switch between Tomsk and HeartMath stations in spectrogram |
| All cron jobs active | `SELECT * FROM cron.job;` shows 6 scheduled jobs |

---

## 3.7 File Paths Created/Modified

```
src/
  app/
    api/
      export/
        route.ts                        (new)
    (dashboard)/
      page.tsx                          (modified — add historical + correlation zones)
  components/
    charts/
      historical-explorer.tsx           (new)
      multi-variable-chart.tsx          (new)
      correlation-scatter.tsx           (new)
  lib/
    queries.ts                         (extended — historical + correlation queries)
    correlation.ts                     (new — Pearson r, lag, regression)
supabase/
  functions/
    scrape-heartmath/
      index.ts                         (new)
    scrape-heartmath-power/
      index.ts                         (new)
    backfill-omni/
      index.ts                         (new)
```

---

## 3.8 Dependency Graph

```
Task 3.1 (Historical explorer)
  ├── Task 3.2 (Multi-variable overlay)
  └── Task 3.3 (Correlation scatter)
        └── Task 3.10 (Integrate into dashboard)

UA-3.1 (DevTools discovery) ── Task 3.5 (scrape-heartmath-power)
UA-3.2 (Calendar URL) ── Task 3.4 (scrape-heartmath)
UA-3.3 (Backfill range) ── Task 3.6 (backfill-omni)

Tasks 3.4, 3.5 deployed ── Task 3.8 (pg_cron) ── Task 3.9 (Dashboard update)

Task 3.7 (Export) ── independent, can run in parallel

Task 3.9 + 3.10 ── Final integration
```

---

## 3.9 Data Retention Implementation

Since we confirmed "images 90 days, data forever," add a cleanup cron:

```sql
SELECT cron.schedule(
  'cleanup-old-images', '0 4 * * 0',  -- weekly, Sunday 4 AM
  $$
  -- Delete image records older than 90 days
  DELETE FROM sr_spectrograms WHERE time < NOW() - INTERVAL '90 days';
  -- Note: also need to delete from storage bucket via Edge Function
  $$
);
```

Create a small `cleanup-images` Edge Function to delete actual files from `sr-spectrograms-raw` bucket for entries older than 90 days.
