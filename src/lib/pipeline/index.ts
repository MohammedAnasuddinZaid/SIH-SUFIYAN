import { gauges, getGaugeByRiver, distanceKm } from "./gauges";
import { fetchFloodDischarge, fetchRainfall, type FloodPoint, type WeatherPoint } from "./providers";
import { cacheGet, cacheSet } from "./cache";
import { computeFloodRisk, buildDischargeSeries } from "@/lib/ml/flood-risk";
import { estimateWaterQuality } from "@/lib/ml/water-quality";
import { round, clamp } from "@/lib/ml/statistics";
import { rivers } from "@/lib/demo-data/rivers";
import { monitoringZones } from "@/lib/demo-data/monitoring-zones";
import type {
  LiveSnapshot,
  RiverLiveData,
  DataSourceInfo,
  ZoneLiveReading,
  FloodRiskLevel,
} from "./types";

const CACHE_TTL_MS = Number(process.env.PIPELINE_CACHE_TTL_MS) || 2 * 60 * 1000;
const SNAPSHOT_KEY = "live-snapshot-v4";

interface Hydrol {
  flood: FloodPoint[] | null;
  rain: WeatherPoint[] | null;
  floodLive: boolean;
  rainLive: boolean;
}

async function fetchHydrology(): Promise<Hydrol> {
  const [flood, rain] = await Promise.allSettled([
    fetchFloodDischarge(gauges),
    fetchRainfall(gauges),
  ]);
  const floodVal = flood.status === "fulfilled" ? flood.value : null;
  const rainVal = rain.status === "fulfilled" ? rain.value : null;
  return {
    flood: floodVal,
    rain: rainVal,
    floodLive: !!floodVal,
    rainLive: !!rainVal,
  };
}

function seededSeries(seed: number, days: number, base: number, amplitude: number, trend = 0): number[] {
  const out: number[] = [];
  for (let i = 0; i < days; i++) {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    const r = x - Math.floor(x);
    const seasonal = Math.sin((i / 30) * Math.PI * 2) * amplitude * 0.4;
    out.push(Math.max(0.5, base + seasonal + (r - 0.5) * amplitude + i * trend));
  }
  return out;
}

function fallbackHydrology(): Hydrol {
  const today = new Date();
  const dates = Array.from({ length: 45 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (44 - i));
    return d.toISOString().split("T")[0];
  });
  const forecastDates = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1 + i);
    return d.toISOString().split("T")[0];
  });

  const flood: FloodPoint[] = gauges.map((gauge, gi) => {
    const hist = seededSeries(gi + 1, 45, gauge.baseM3s, gauge.baseM3s * 0.28);
    const histMax = seededSeries(gi + 101, 45, gauge.baseM3s * 1.1, gauge.baseM3s * 0.3);
    const histMin = seededSeries(gi + 201, 45, gauge.baseM3s * 0.9, gauge.baseM3s * 0.2);
    const histMean = seededSeries(gi + 301, 45, gauge.baseM3s, gauge.baseM3s * 0.24);
    const lastVal = hist[hist.length - 1] ?? gauge.baseM3s;
    return {
      gauge,
      dates: [...dates, ...forecastDates],
      discharge: [...hist, ...forecastDates.map((_, fi) => round(lastVal + Math.sin(fi / 3) * gauge.baseM3s * 0.15, 2))],
      dischargeMax: [...histMax, ...forecastDates.map((_, fi) => round((lastVal * 1.1) + Math.sin(fi / 3) * gauge.baseM3s * 0.18, 2))],
      dischargeMin: [...histMin, ...forecastDates.map((_, fi) => round((lastVal * 0.9) + Math.sin(fi / 3) * gauge.baseM3s * 0.12, 2))],
      dischargeMean: [...histMean, ...forecastDates.map((_, fi) => round(lastVal + Math.cos(fi / 2) * gauge.baseM3s * 0.1, 2))],
    };
  });

  const rain: WeatherPoint[] = gauges.map((gauge, gi) => ({
    gauge,
    dates,
    precipitation: seededSeries(gi + 401, 45, 3, 12).map((v) => (v < 0.3 ? 0 : v)),
  }));

  return { flood, rain, floodLive: false, rainLive: false };
}

function sliceArrays<T>(arr: T[], fromEnd: number): T[] {
  return arr.slice(-fromEnd);
}

function buildRiver(gauge: (typeof gauges)[number], hydrol: Hydrol): RiverLiveData {
  const floodPoint = hydrol.flood?.find((f) => f.gauge.riverId === gauge.riverId);
  const rainPoint = hydrol.rain?.find((r) => r.gauge.riverId === gauge.riverId);

  const allDates = floodPoint?.dates ?? [];
  const obsHistory = floodPoint?.discharge ?? [];
  // Derive the actual split point from data: forecast dates start after observed
  const totalDates = allDates.length;
  const obsCount = Math.min(45, totalDates - 10);
  const obsDates = allDates.slice(0, obsCount);
  const fcDates = allDates.slice(obsCount);
  const fcMean = floodPoint?.dischargeMean.slice(obsCount) ?? [];
  const fcMin = floodPoint?.dischargeMin.slice(obsCount) ?? [];
  const fcMax = floodPoint?.dischargeMax.slice(obsCount) ?? [];

  const rainHistory = rainPoint?.precipitation ?? [];
  const rainDates = rainPoint?.dates ?? [];
  const rainLast24h = rainHistory.length ? (rainHistory[rainHistory.length - 1] ?? 0) : 0;

  const dischargeSeries = buildDischargeSeries(
    sliceArrays(obsDates, 30),
    sliceArrays(obsHistory, 30),
    fcDates,
    fcMean,
    fcMin,
    fcMax
  );

  const floodRisk = computeFloodRisk({
    gaugeId: gauge.riverId,
    history: obsHistory,
    forecastMean: fcMean,
    forecastMax: fcMax,
    dates: obsDates,
    rainfallLast24h: rainLast24h,
    baseM3s: gauge.baseM3s,
    floodThresholdM3s: gauge.floodThresholdM3s,
    dangerThresholdM3s: gauge.dangerThresholdM3s,
  });

  // Use actual API rainfall forecast data where available, not synthetic
  const rainFcDates = rainPoint?.dates?.slice(obsCount) ?? [];
  const rainFcValues = rainPoint?.precipitation?.slice(obsCount) ?? [];
  const rainfallSeries = {
    last24h: round(rainLast24h, 1),
    unit: "mm",
    history: sliceArrays(rainDates, 30).map((d, i) => ({
      date: d,
      value: round(rainHistory[Math.max(0, rainHistory.length - 30 + i)] ?? 0, 1),
    })),
    forecast: rainFcDates.slice(0, 7).map((d, i) => ({
      date: d,
      value: round(Math.max(0, rainFcValues[i] ?? 0), 1),
    })),
  };

  const dischargeNow = dischargeSeries.current || gauge.baseM3s;
  const waterQuality = estimateWaterQuality({
    riverId: gauge.riverId,
    dischargeNow,
    dischargeRatio: round(clamp(dischargeNow / gauge.baseM3s, 0.2, 3)),
    dischargeHistory: obsHistory,
    dischargeDates: obsDates,
    rainfallLast24h: rainLast24h,
    rainfallHistory: rainHistory,
    rainfallDates: rainDates,
  });

  return {
    riverId: gauge.riverId,
    riverName: rivers.find((r) => r.id === gauge.riverId)?.displayName ?? gauge.name,
    gauge: { lat: gauge.lat, lon: gauge.lon },
    discharge: dischargeSeries,
    rainfall: rainfallSeries,
    floodRisk,
    waterQuality,
    updatedAt: new Date().toISOString(),
  };
}

function buildZones(rivers: RiverLiveData[]): ZoneLiveReading[] {
  return monitoringZones.map((zone) => {
    const river = rivers.find((r) => r.riverId === zone.riverId);
    const gauge = getGaugeByRiver(zone.riverId);
    if (!river || !gauge) {
      return {
        zoneId: zone.id,
        riverId: zone.riverId,
        floodRisk: "Low",
        rainfallLast24hMm: 0,
        wqiEstimate: zone.waterQualityScore,
      };
    }
    const dist = distanceKm(zone.latitude, zone.longitude, gauge.lat, gauge.lon);
    // Fractional decay of gauge flood risk with distance from the gauge
    const decay = clamp(1 - dist / 90, 0.35, 1);
    const zScore = clamp(river.floodRisk.score * decay + (100 - zone.waterQualityScore) * 0.2, 0, 100);
    const level: FloodRiskLevel =
      zScore >= 75 ? "Critical" : zScore >= 50 ? "High" : zScore >= 30 ? "Moderate" : "Low";
    const wqiEstimate = Math.round(clamp(river.waterQuality.wqi * 0.65 + zone.waterQualityScore * 0.35, 0, 100));

    return {
      zoneId: zone.id,
      riverId: zone.riverId,
      floodRisk: level,
      rainfallLast24hMm: round(river.rainfall.last24h, 1),
      wqiEstimate,
      liveEvent: level === "Critical" ? true : undefined,
    };
  });
}

export async function getLiveSnapshot(): Promise<LiveSnapshot> {
  const cached = cacheGet<LiveSnapshot>(SNAPSHOT_KEY);
  if (cached) return cached;

  const hydrol = await fetchHydrology();
  const fallback = fallbackHydrology();

  // Merge per-gauge: prefer real upstream data, backfill missing gauges with
  // the deterministic simulation so the board is always fully populated.
  const effectiveHydrol: Hydrol = {
    floodLive: (hydrol.flood?.length ?? 0) > 0,
    rainLive: (hydrol.rain?.length ?? 0) > 0,
    flood:
      (hydrol.flood?.length ?? 0) > 0
        ? gauges.map((gauge) => {
            const live = hydrol.flood?.find((f) => f.gauge.riverId === gauge.riverId);
            const sim = fallback.flood?.find((f) => f.gauge.riverId === gauge.riverId);
            return live ?? sim!;
          })
        : fallback.flood,
    rain:
      (hydrol.rain?.length ?? 0) > 0
        ? gauges.map((gauge) => {
            const live = hydrol.rain?.find((r) => r.gauge.riverId === gauge.riverId);
            const sim = fallback.rain?.find((r) => r.gauge.riverId === gauge.riverId);
            return live ?? sim!;
          })
        : fallback.rain,
  };

  const riverData = gauges.map((gauge) => buildRiver(gauge, effectiveHydrol));
  const zones = buildZones(riverData);

  const sources: DataSourceInfo[] = [
    {
      key: "glofas",
      name: "GloFAS v4 — global river discharge (ECMWF)",
      status: effectiveHydrol.floodLive ? "live" : "simulated",
      isLive: !!effectiveHydrol.floodLive,
      updatedAt: new Date().toISOString(),
      note: effectiveHydrol.floodLive
        ? "Real-time river discharge simulation & 10-day forecast (Open-Meteo)"
        : "Offline — deterministic simulation while upstream API is unreachable",
      license: "CC BY 4.0 · Open-Meteo / ECMWF",
    },
    {
      key: "open-meteo-weather",
      name: "Open-Meteo Weather — precipitation",
      status: effectiveHydrol.rainLive ? "live" : "simulated",
      isLive: !!effectiveHydrol.rainLive,
      updatedAt: new Date().toISOString(),
      note: effectiveHydrol.rainLive
        ? "Observed daily precipitation at each river gauge"
        : "Offline — deterministic simulation",
      license: "CC BY 4.0",
    },
    {
      key: "wq-estimator",
      name: "JAL-SURAKSHA water-quality estimator",
      status: "estimated",
      isLive: false,
      updatedAt: new Date().toISOString(),
      note: "Deterministic model blending live hydrology with CPCB-style laboratory baselines",
    },
  ];

  const hydroLive = sources.filter((s) => s.key === "glofas" || s.key === "open-meteo-weather");
  const mode =
    hydroLive.every((s) => s.isLive)
      ? "live"
      : hydroLive.some((s) => s.isLive)
        ? "hybrid"
        : "simulated";

  const snapshot: LiveSnapshot = {
    generatedAt: new Date().toISOString(),
    sources,
    rivers: riverData,
    zones,
    mode,
  };

  return cacheSet(SNAPSHOT_KEY, snapshot, CACHE_TTL_MS);
}