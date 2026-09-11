import type { Gauge } from "./gauges";

// Free, keyless upstreams by default. Override via env to swap in any provider
// (commercial API keys, self-hosted endpoints, CWC/CPCB feeds, etc.).
// - GloFAS flood API: https://open-meteo.com/en/docs/flood-api
// - Weather API: https://open-meteo.com/en/docs
const FLOOD_ENDPOINT =
  process.env.FLOOD_API_URL ?? "https://flood-api.open-meteo.com/v1/flood";
const WEATHER_ENDPOINT =
  process.env.WEATHER_API_URL ?? "https://api.open-meteo.com/v1/forecast";

const FLOOD_API_KEY = process.env.FLOOD_API_KEY ?? process.env.OPEN_METEO_API_KEY ?? "";
const WEATHER_API_KEY = process.env.WEATHER_API_KEY ?? process.env.OPEN_METEO_API_KEY ?? "";

const TIMEOUT_MS = Number(process.env.PIPELINE_FETCH_TIMEOUT_MS) || 10000;
const MAX_RETRIES = 2;

function appendKey(url: string, key: string): string {
  if (!key) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}apikey=${encodeURIComponent(key)}`;
}

interface DailyItem {
  time?: string[];
  [key: string]: unknown;
}

interface LocationBlock {
  latitude?: number | number[];
  longitude?: number | number[];
  daily?: DailyItem;
}

interface SeriesEntry {
  lat: number;
  lon: number;
  dates: string[];
  values: number[];
}

async function fetchJsonWithRetry<T>(url: string, retries = MAX_RETRIES): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      clearTimeout(timer);
      if (!res.ok) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
        return null;
      }
      return (await res.json()) as T;
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}

function asArray(value: LocationBlock | LocationBlock[]): LocationBlock[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Robustly normalises both Open-Meteo response shapes into per-location series:
 *  - array form: [{ latitude, longitude, daily: { time, <key> } }, ...]
 *  - object form: { latitude: number|number[], daily: { time, <key> } }
 *    where multi-location values are concatenated in request order
 *    (time and every variable are flattened across locations).
 */
function normalizeSeries(raw: LocationBlock | LocationBlock[], key: string, gaugeCount: number): SeriesEntry[] {
  const blocks = asArray(raw);

  const isMultiLocObject =
    blocks.length === 1 && Array.isArray(blocks[0]?.latitude) && Array.isArray(blocks[0]?.longitude);

  if (isMultiLocObject) {
    const block = blocks[0];
    const lats = block.latitude as number[];
    const lons = block.longitude as number[];
    const dates = block.daily?.time ?? [];
    const flat = (block.daily?.[key] as number[]) ?? [];
    const per = Math.floor(dates.length / Math.max(1, lats.length));
    if (per === 0 || lats.length === 0) return [];
    if (dates.length === 0) return [];
    return lats.map((lat, i) => ({
      lat,
      lon: lons[i] ?? 0,
      dates: dates.slice(i * per, (i + 1) * per),
      values: flat.slice(i * per, (i + 1) * per),
    }));
  }

  return blocks.slice(0, gaugeCount).map((block) => ({
    lat: (Array.isArray(block.latitude) ? block.latitude[0] : block.latitude) ?? 0,
    lon: (Array.isArray(block.longitude) ? block.longitude[0] : block.longitude) ?? 0,
    dates: block.daily?.time ?? [],
    values: ((block.daily?.[key] as number[]) ?? []).slice(0, (block.daily?.time ?? []).length),
  }));
}

function buildMultiPoint(gauges: Gauge[]) {
  return {
    lat: gauges.map((g) => g.lat).join(","),
    lon: gauges.map((g) => g.lon).join(","),
  };
}

export interface FloodPoint {
  gauge: Gauge;
  dates: string[];
  discharge: number[];
  dischargeMax: number[];
  dischargeMin: number[];
  dischargeMean: number[];
}

export interface WeatherPoint {
  gauge: Gauge;
  dates: string[];
  precipitation: number[];
}

/**
 * Fetches GloFAS river-discharge simulation + forecast for all gauges.
 * Returns null when the grid is missing or response is malformed.
 */
export async function fetchFloodDischarge(gauges: Gauge[]): Promise<FloodPoint[] | null> {
  const { lat, lon } = buildMultiPoint(gauges);
  const past = 45;
  const forecast = 10;
  let url =
    `${FLOOD_ENDPOINT}?latitude=${lat}&longitude=${lon}` +
    `&daily=river_discharge,river_discharge_max,river_discharge_min,river_discharge_mean` +
    `&past_days=${past}&forecast_days=${forecast}`;
  url = appendKey(url, FLOOD_API_KEY);
  const data = await fetchJsonWithRetry<LocationBlock | LocationBlock[]>(url);
  if (!data) return null;

  const discharge = normalizeSeries(data, "river_discharge", gauges.length);
  const dischargeMax = normalizeSeries(data, "river_discharge_max", gauges.length);
  const dischargeMin = normalizeSeries(data, "river_discharge_min", gauges.length);
  const dischargeMean = normalizeSeries(data, "river_discharge_mean", gauges.length);

  if (discharge.length === 0) return null;
  if ((discharge[0]?.dates.length ?? 0) === 0) return null;

  // Be lenient: map what we got, skip gauges we didn't receive data for
  return gauges
    .map((gauge, i) => {
      const d = discharge[i];
      const max = dischargeMax[i];
      const min = dischargeMin[i];
      const mean = dischargeMean[i];
      if (!d || d.dates.length === 0) return null;
      return {
        gauge,
        dates: d.dates,
        discharge: d.values,
        dischargeMax: max?.values ?? d.values,
        dischargeMin: min?.values ?? d.values,
        dischargeMean: mean?.values ?? d.values,
      };
    })
    .filter((p): p is FloodPoint => p !== null);
}

export async function fetchRainfall(gauges: Gauge[]): Promise<WeatherPoint[] | null> {
  const { lat, lon } = buildMultiPoint(gauges);
  let url =
    `${WEATHER_ENDPOINT}?latitude=${lat}&longitude=${lon}` +
    `&daily=precipitation_sum&past_days=45&forecast_days=10&timezone=auto`;
  url = appendKey(url, WEATHER_API_KEY);
  const data = await fetchJsonWithRetry<LocationBlock | LocationBlock[]>(url);
  if (!data) return null;

  const precip = normalizeSeries(data, "precipitation_sum", gauges.length);
  if (precip.length === 0) return null;
  if ((precip[0]?.dates.length ?? 0) === 0) return null;

  return gauges
    .map((gauge, i) => {
      const p = precip[i];
      if (!p || p.dates.length === 0) return null;
      return {
        gauge,
        dates: p.dates,
        precipitation: p.values,
      };
    })
    .filter((p): p is WeatherPoint => p !== null);
}
