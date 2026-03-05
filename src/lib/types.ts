export interface SrReading {
  time: string
  source_id: string
  mode_number: number
  frequency_hz: number | null
  amplitude_pt: number | null
  q_factor: number | null
  power_density: number | null
  raw_timestamp: string | null
}

export interface SpaceWeather {
  time: string
  kp_index: number | null
  dst_index: number | null
  bz_component: number | null
  solar_wind_speed: number | null
  proton_density: number | null
  ae_index: number | null
  f10_index: number | null
  flare_class: string | null
}

export interface SrSpectrogram {
  id: number
  time: string
  source_id: string
  image_type: 'amplitude' | 'frequency' | 'spectrogram' | 'qfactor'
  image_path: string
  processed: boolean
}

export interface SourceHealth {
  id: number
  time: string
  source_id: string
  status: 'ok' | 'error' | 'degraded' | 'offline' | 'parse_error' | 'rate_limited'
  latency_ms: number | null
  error_message: string | null
  rows_inserted: number
}

export interface HourlyAgg {
  bucket: string
  source_id: string
  mode_number: number
  avg_freq: number | null
  avg_amp: number | null
  max_amp: number | null
  min_amp: number | null
  stddev_amplitude: number | null
  sample_count: number
}
