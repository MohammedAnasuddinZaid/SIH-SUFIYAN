import type { Gauge } from "./gauges";

const FLOOD_ENDPOINT = "https://flood-api.open-meteo.com/v1/flood";
const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

const TIMEOUT_MS = 8000;

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

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function asArray(value: LocationBlock | LocationBlock[], gaugeCount: number): LocationBlock[] {
  if (Array.isArray(value)) return value;
  if (gaugeCount > 1) {
    // Some endpoints return a flat object even for multiple locations; treat
    // every coordinate as a single-entry edge case handled by the splitter.
    return [value];
  }
  return [value];
}

/**
 * Robustly normalises both Open-Meteo response shapes into per-location series:
 *  - array form: [{ latitude, longitude, daily: { time, <key> } }, ...]
 *  - object form: { latitude: number|number[], daily: { time, <key> } }
 *    where multi-location values are concatenated in request order.
 */
function normalizeSeries(raw: LocationBlock | LocationBlock[], key: string, gaugeCount: number): SeriesEntry[] {
  const blocks = asArray(raw, gaugeCount);

  const latIsMul = Array.isArray(blocks[0]?.latitude);
  const lonIsMul = Array.isArray(blocks[0]?.longitude);
  if (latIsMul && blocks.length === 1) {
    const block = blocks[0];
    const lats = block.latitude as number[];
    const lons = block.longitude as number[];
    const dates = block.daily?.time ?? [];
    const flat = (block.daily?.[key] as number[]) ?? [];
    const per = flat.length / Math.max(1, lats.length);
    return lats.map((lat, i) => ({
      lat,
      lon: lons[i] ?? 0,
      dates,
      values: flat.slice(Math.round(i * per), Math.round((i + 1) * per)),
    }));
  }

  return blocks.map((block) => ({
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
 * Fetches spring GloFAS river-discharge simulation + ECWMF forecast for all
 * gauges in a single batched request. Returns null when the grid is missing.
 */
export async function fetchFloodDischarge(gauges: Gauge[]): Promise<FloodPoint[] | null> {
  const { lat, lon } = buildMultiPoint(gauges);
  const past = 45;
  const forecast = 10;
  const url =
    `${FLOOD_ENDPOINT}?latitude=${lat}&longitude=${lon}` +
    `&daily=river_discharge,river_discharge_max,river_discharge_min,river_discharge_mean` +
    `&past_days=${past}&forecast_days=${forecast}`;
  const data = await fetchJson<LocationBlock | LocationBlock[]>(url);
  if (!data) return null;

  const best = Array.isArray(data) ? data.length : 1;
  if (best !== gauges.length) return null;

  const discharge = normalizeSeries(data, "river_discharge", gauges.length);
  const dischargeMax = normalizeSeries(data, "river_discharge_max", gauges.length);
  const dischargeMin = normalizeSeries(data, "river_discharge_min", gauges.length);
  const dischargeMean = normalizeSeries(data, "river_discharge_mean", gauges.length);

  if (discharge.length !== gauges.length) return null;
  if ((discharge[0]?.dates.length ?? 0) === 0) return null;

  return gauges.map((gauge, i) => {
    const d = discharge[i];
    const max = dischargeMax[i];
    const min = dischargeMin[i];
    const mean = dischargeMean[i];
    return {
      gauge,
      dates: d?.dates ?? [],
      discharge: d?.values ?? [],
      dischargeMax: max?.values ?? [],
      dischargeMin: min?.values ?? [],
      dischargeMean: mean?.values ?? [],
    };
  });
}

export async function fetchRainfall(gauges: Gauge[]): Promise<WeatherPoint[] | null> {
  const { lat, lon } = buildMultiPoint(gauges);
  const url =
    `${WEATHER_ENDPOINT}?latitude=${lat}&longitude=${lon}` +
    `&daily=precipitation_sum&past_days=45&forecast_days=10&timezone=auto`;
  const data = await fetchJson<LocationBlock | LocationBlock[]>(url);
  if (!data) return null;

  const best = Array.isArray(data) ? data.length : 1;
  if (best !== gauges.length) return null;

  const precip = normalizeSeries(data, "precipitation_sum", gauges.length);
  if (precip.length !== gauges.length) return null;
  if ((precip[0]?.dates.length ?? 0) === 0) return null;

  return gauges.map((gauge, i) => ({
    gauge,
    dates: precip[i]?.dates ?? [],
    precipitation: precip[i]?.values ?? [],
  }));
}