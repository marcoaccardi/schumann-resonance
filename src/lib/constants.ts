// ── Station Definitions ─────────────────────────────────────────────

export interface Station {
  id: string
  label: string
  lat: number
  lon: number
  color: string
}

export const STATIONS: Station[] = [
  { id: 'tomsk', label: 'Tomsk', lat: 56.48, lon: 84.95, color: '#58A6FF' },
  { id: 'heartmath_gci001', label: 'California', lat: 37.38, lon: -122.08, color: '#3FB950' },
  { id: 'heartmath_gci002', label: 'Saudi Arabia', lat: 24.71, lon: 46.67, color: '#E3B341' },
  { id: 'heartmath_gci003', label: 'Lithuania', lat: 54.69, lon: 25.28, color: '#F85149' },
  { id: 'heartmath_gci004', label: 'Alberta', lat: 51.05, lon: -114.07, color: '#BC8CFF' },
  { id: 'heartmath_gci005', label: 'New Zealand', lat: -36.85, lon: 174.76, color: '#79C0FF' },
  { id: 'heartmath_gci006', label: 'South Africa', lat: -33.92, lon: 18.42, color: '#D2A8FF' },
  { id: 'cumiana', label: 'Cumiana (Italy)', lat: 44.98, lon: 7.38, color: '#FFA657' },
] as const

export const STATION_MAP = Object.fromEntries(
  STATIONS.map((s) => [s.id, s])
) as Record<string, Station>

// ── SR Mode Frequencies ─────────────────────────────────────────────

export const MODE_FREQUENCIES = [7.83, 14.3, 20.8, 27.3, 33.8, 39.0] as const

export const MODE_LABELS = [
  'Mode 1 (7.83 Hz)',
  'Mode 2 (14.3 Hz)',
  'Mode 3 (20.8 Hz)',
  'Mode 4 (27.3 Hz)',
  'Mode 5 (33.8 Hz)',
  'Mode 6 (39.0 Hz)',
] as const

// ── NOAA SWPC Endpoints ─────────────────────────────────────────────

export const NOAA_ENDPOINTS = {
  KP_FORECAST: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json',
  KP_1M: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
  DST: 'https://services.swpc.noaa.gov/products/kyoto-dst.json',
  MAG_1DAY: 'https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json',
  PLASMA_1DAY: 'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json',
  ALERTS: 'https://services.swpc.noaa.gov/products/alerts.json',
  XRAYS_1DAY: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json',
} as const

// ── Tomsk Image URLs ────────────────────────────────────────────────

export const TOMSK_URLS = {
  AMPLITUDE: 'https://sosrff.tsu.ru/new/sra.jpg',
  FREQUENCY: 'https://sosrff.tsu.ru/new/srf.jpg',
  SPECTROGRAM: 'https://sosrff.tsu.ru/new/shm.jpg',
  Q_FACTOR: 'https://sosrff.tsu.ru/new/srq.jpg',
} as const
