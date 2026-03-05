# PRD Phase 2 — Dark Cosmos Dashboard (Live UI)

## 2.1 Goals & Deliverables

At the end of Phase 2, the following must be working:

1. **Dark Cosmos visual theme** — CSS custom properties for full palette, JetBrains Mono + Plus Jakarta Sans fonts, dark background (#0D1117)
2. **ECharts Dark Cosmos theme** registered and used by all charts
3. **Zustand store** with Supabase Realtime subscription — auto-updates on new `sr_readings` INSERTs
4. **Live spectrogram heatmap** (ECharts) — time x frequency x power, real-time updates, pulsing glow on newest column
5. **Mode Tracker panel** — 6 cards (one per SR harmonic), showing: current frequency, amplitude, deviation, 24h sparkline, status badge
6. **Canvas 2D particle system** — full-viewport background, responds to `currentAmplitude` and `currentKp`
7. **Space weather overlay** — Kp as colored background band on time-series charts
8. **"What's Happening Now" summary card** — template-based plain-language description
9. **Dashboard layout** — `react-resizable-panels` in 4-zone grid (Hero, Correlation, Analysis placeholder, Status)
10. **Responsive** — mobile: zones stack vertically, spectrogram on top

---

## 2.2 Prerequisites

- Phase 1 fully complete (all exit criteria met)
- Database has at least a few hours of Tomsk SR data + NOAA space weather data
- Next.js runs locally with Supabase connection working
- Phase 2 npm deps already installed in Phase 1

---

## 2.3 Detailed Tasks (Ordered)

### Task 2.1: Dark Cosmos CSS Theme

**File:** `src/app/globals.css`

Define CSS custom properties from blueprint Section 4.1:
```css
:root {
  --bg-base: #0D1117;
  --bg-elevated: #161B22;
  --surface: #21262D;
  --border: #30363D;
  --text-primary: #E6EDF3;
  --text-secondary: #8B949E;
  --accent-blue: #58A6FF;
  --accent-green: #3FB950;
  --accent-gold: #E3B341;
  --accent-red: #F85149;
  --accent-purple: #BC8CFF;
  --glow-blue: rgba(88,166,255,0.15);
  --glow-gold: rgba(227,179,65,0.2);
}
```

- Body background: `var(--bg-base)`, text: `var(--text-primary)`
- Override shadcn/ui CSS variables to match Dark Cosmos
- Utility classes: `.glow-blue`, `.glow-gold`, `.glow-red` (box-shadow glows)
- `@keyframes pulse-glow` animation (opacity 0.8-1.0, ~0.5 Hz cycle)

**Blocked by:** Nothing

---

### Task 2.2: Set Up Fonts

**File:** `src/app/layout.tsx`

- Import JetBrains Mono + Plus Jakarta Sans from `next/font/google`
- Plus Jakarta Sans as default body font
- JetBrains Mono as CSS variable `--font-mono` for data values and chart labels

**Blocked by:** Nothing

---

### Task 2.3: Register ECharts Dark Cosmos Theme

**File:** `src/lib/echarts-theme.ts`

- Copy exact theme registration from blueprint Section 4.1 (`echarts.registerTheme('darkCosmos', {...})`)
- Export `ECHARTS_THEME = 'darkCosmos'`

**File:** `src/components/charts/echarts-provider.tsx`

- Client component that registers theme on mount
- Wrap dashboard in this provider

**Blocked by:** Task 2.1

---

### Task 2.4: Implement Zustand Store

**File:** `src/lib/store.ts`

```typescript
interface AppStore {
  // Live data (via Supabase Realtime)
  latestReadings: Map<string, SrReading[]>;  // keyed by source_id
  latestWeather: SpaceWeather | null;
  sourceHealth: Record<string, SourceHealth>;

  // Spectrogram buffer (last 4 hours raw data for heatmap)
  spectrogramBuffer: SrReading[];

  // Derived state
  currentAmplitude: number;   // drives particles + glow
  currentKp: number;          // drives particle color + timbre
  anomalyActive: boolean;     // drives red glow

  // UI state
  audioEnabled: boolean;
  selectedStation: string;
  dateRange: [Date, Date];
  visibleModes: number[];
  particlesEnabled: boolean;

  // Actions
  addReading: (reading: SrReading) => void;
  updateWeather: (weather: SpaceWeather) => void;
  setSelectedStation: (station: string) => void;
  setDateRange: (range: [Date, Date]) => void;
  toggleParticles: () => void;
}
```

- `addReading`: append to `spectrogramBuffer`, update `latestReadings`, recalculate `currentAmplitude`
- Middleware: devtools (debugging) + persist (UI preferences only)

**Blocked by:** Phase 1 Task 1.3 (types)

---

### Task 2.5: Wire Supabase Realtime Subscription

**File:** `src/lib/realtime.ts`

```typescript
const channel = supabase.channel('sr-live')
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'sr_readings'
  }, (payload) => {
    useAppStore.getState().addReading(payload.new as SrReading);
  })
  .subscribe();
```

- Also subscribe to `space_weather` INSERT → update `latestWeather`
- Also subscribe to `source_health` INSERT → update `sourceHealth`
- Lifecycle: subscribe on mount, unsubscribe on unmount

**File:** `src/components/realtime-provider.tsx` — client component wrapping dashboard

**Blocked by:** Task 2.4, Phase 1 Task 1.2

---

### Task 2.6: Initial Data Loader

**File:** `src/lib/queries.ts`

Functions to populate store before Realtime takes over:
- `fetchRecentReadings(hours: number)` — query `sr_readings` last N hours
- `fetchLatestWeather()` — `space_weather` ORDER BY time DESC LIMIT 1
- `fetchSourceHealth()` — latest status per source_id
- `fetchSpectrogramData(startTime, endTime, sourceId)` — heatmap data

Use `@tanstack/react-query` for caching and background refetch.

**Blocked by:** Task 2.4, Phase 1 Task 1.2

---

### Task 2.7: Live Spectrogram Component

**File:** `src/components/charts/live-spectrogram.tsx`

Client component using `echarts-for-react`:
- X-axis: `type: 'time'`, last 4 hours default
- Y-axis: `type: 'value'`, 0-50 Hz
- Visual map: Dark Cosmos colormap (deep space black → aurora purple → solar gold)
- Series: `type: 'heatmap'`, data from `spectrogramBuffer`
- Progressive rendering: `progressive: 1000`
- Time range buttons: 1h, 4h (default), 24h
- Source selector: shadcn Select (Tomsk only in Phase 2, HeartMath added Phase 3)
- Pulsing glow on newest column: ECharts `markArea` or CSS overlay with `pulse-glow`
- Real-time update: `echartsInstance.setOption()` on buffer change

**Blocked by:** Task 2.3, Task 2.6

---

### Task 2.8: Mode Tracker Panel

**File:** `src/components/mode-tracker.tsx`

6 shadcn Cards in responsive grid (3x2 desktop, 2x3 tablet, 1x6 mobile):

Each card for one SR mode (1-6):
- Mode label: "Mode 1" with nominal frequency (7.83 Hz)
- Current frequency: large JetBrains Mono text with glow, e.g. "7.85 Hz"
- Deviation: "+0.02 Hz" — green (<0.1), gold (<0.3), red (>0.3)
- Current amplitude: "2.4 pT"
- 24h sparkline: mini ECharts line chart (no axes, just line + area fill)
- Status badge: green (within 1σ), gold (1-2σ), red (>2σ of 7-day rolling mean)
- Subtle pulse animation at rate derived from mode frequency

**File:** `src/components/charts/sparkline.tsx` — minimal ECharts line chart

**Blocked by:** Task 2.6, Task 2.3

---

### Task 2.9: Particle System

**File:** `src/components/particles/particle-canvas.tsx`

Client component — full-viewport Canvas 2D:
- CSS: `position: fixed; inset: 0; z-index: -1; pointer-events: none;`
- Particle class: x, y, vx, vy, size, color, opacity, life
- Count: 50-300, mapped to `currentAmplitude` (low=50, high=300)
- Motion: drift upward, speed increases with amplitude
- Color: blue (Kp<3), purple (Kp 3-5), gold (Kp>5)
- Size: 1-4px, larger during elevated conditions
- Opacity: subtle fade in/out over lifetime
- Optional: gentle mouse repulsion

Animation loop: `requestAnimationFrame` at 30-60 fps, independent of React renders.
Read from Zustand via `subscribe` (not React hooks) to avoid re-renders.
Toggle via `particlesEnabled` in store.

**Blocked by:** Task 2.4

---

### Task 2.10: Space Weather Overlay

**File:** `src/components/charts/space-weather-overlay.tsx`

Reusable ECharts overlay for any time-series chart:
- Kp 0-3: no band (quiet)
- Kp 4: gold band, label "Active"
- Kp 5-6: orange band, label "Storm"
- Kp 7+: red band, label "Severe Storm"

Uses ECharts `markArea`. Composable into spectrogram and historical charts.

**Blocked by:** Task 2.3, Task 2.6

---

### Task 2.11: "What's Happening Now" Summary Card

**File:** `src/components/summary-card.tsx`

Template-based text generation (NOT AI/LLM):
```typescript
function generateSummary(
  readings: SrReading[],
  weather: SpaceWeather,
  health: Record<string, SourceHealth>
): string {
  // Check source health
  // Check SR amplitude deviation from baseline
  // Check Kp level
  // Build sentence from templates
  // e.g. "SR amplitude is elevated (+2.1σ). Kp is 5 (minor storm)."
  // e.g. "Schumann Resonance in normal range. Kp is 2 (quiet)."
}
```

- shadcn Card with Dark Cosmos styling
- Updates automatically from Zustand store
- Shows: SR status, Kp status, source health warnings

**Blocked by:** Task 2.4, Task 2.6

---

### Task 2.12: Dashboard Layout

**File:** `src/app/(dashboard)/page.tsx` (replace placeholder from Phase 1)
**File:** `src/app/(dashboard)/layout.tsx`

4-zone layout using `react-resizable-panels`:

```
┌─────────────────────────────────────┐
│ HERO ZONE                           │
│ Live Spectrogram + Mode Tracker     │
├────────────────────┬────────────────┤
│ CORRELATION ZONE   │ STATUS ZONE    │
│ (placeholder P3)   │ Summary Card   │
│                    │ Source Health   │
│                    │ Space Weather   │
├────────────────────┴────────────────┤
│ ANALYSIS ZONE (placeholder for P3)  │
└─────────────────────────────────────┘
```

- Panels resizable via drag handles
- Particle canvas behind everything (fixed position)
- Mobile: stack vertically, spectrogram on top, no resize
- Framer-motion staggered reveal on initial load

**Blocked by:** Tasks 2.7, 2.8, 2.9, 2.10, 2.11

---

## 2.4 Exit Criteria

| Criterion | Verification |
|-----------|-------------|
| Dark theme applied | Page background is #0D1117, text is light, no white flashes |
| Fonts loaded | JetBrains Mono visible on data values, Plus Jakarta Sans on body text |
| Spectrogram renders | Heatmap shows frequency × time with colored power values |
| Real-time updates | New Tomsk scrape appears on spectrogram within seconds |
| Mode cards show data | All 6 cards display current freq, amplitude, sparkline |
| Particles animate | Background particles visible, count changes with amplitude |
| Kp overlay works | Gold/orange/red band appears on chart during elevated Kp |
| Summary text updates | Card shows meaningful sentence about current conditions |
| Panels resizable | Drag handles work between zones |
| Mobile responsive | On narrow viewport, zones stack vertically |

---

## 2.5 File Paths Created

```
src/
  app/
    globals.css                         (modified — Dark Cosmos theme)
    layout.tsx                          (modified — fonts)
    (dashboard)/
      layout.tsx                        (modified — layout with panels)
      page.tsx                          (rewritten — full dashboard)
  components/
    charts/
      echarts-provider.tsx              (new)
      live-spectrogram.tsx              (new)
      sparkline.tsx                     (new)
      space-weather-overlay.tsx         (new)
    particles/
      particle-canvas.tsx               (new)
    mode-tracker.tsx                    (new)
    summary-card.tsx                    (new)
    realtime-provider.tsx              (new)
  lib/
    echarts-theme.ts                   (new)
    realtime.ts                        (new)
    queries.ts                         (new)
    store.ts                           (rewritten — full store)
```

---

## 2.6 Dependency Graph

```
Task 2.1 (CSS Theme) ─┬── Task 2.3 (ECharts theme)
Task 2.2 (Fonts)      │
                       ├── Task 2.7 (Spectrogram)
                       ├── Task 2.8 (Mode Tracker)
                       └── Task 2.10 (Space Weather overlay)

Task 2.4 (Zustand store) ─┬── Task 2.5 (Realtime subscription)
                           ├── Task 2.6 (Initial data loader)
                           ├── Task 2.9 (Particles)
                           └── Task 2.11 (Summary card)

Task 2.5 + 2.6 ── Task 2.7, 2.8, 2.10, 2.11

All above ── Task 2.12 (Dashboard layout assembly)
```
