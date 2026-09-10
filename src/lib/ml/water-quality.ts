import type { WaterQualityEstimate } from "@/lib/pipeline/types";
import { detectAnomalies, forecastSeries, lastN, round } from "./statistics";
import { getMeasurementsByRiver } from "@/lib/demo-data/water-measurements";

export interface WqBaseline {
  phBase: number;
  doBase: number;
  turbBase: number;
  bodBase: number;
  codBase: number;
  wqiBase: number;
}

const RIVER_BASELINE: Record<string, WqBaseline> = {
  "river-musi": { phBase: 7.0, doBase: 4.5, turbBase: 25, bodBase: 4.8, codBase: 32, wqiBase: 50 },
  "river-ganga": { phBase: 7.4, doBase: 5.1, turbBase: 22, bodBase: 4.2, codBase: 28, wqiBase: 55 },
  "river-yamuna": { phBase: 7.6, doBase: 3.2, turbBase: 30, bodBase: 6.5, codBase: 44, wqiBase: 38 },
  "river-godavari": { phBase: 7.2, doBase: 5.8, turbBase: 18, bodBase: 3.4, codBase: 24, wqiBase: 62 },
  "river-krishna": { phBase: 7.3, doBase: 5.5, turbBase: 20, bodBase: 3.6, codBase: 25, wqiBase: 60 },
  "river-brahmaputra": { phBase: 7.1, doBase: 6.4, turbBase: 14, bodBase: 2.8, codBase: 19, wqiBase: 70 },
};

export interface WqRequest {
  riverId: string;
  dischargeNow: number;
  dischargeRatio: number; // now / seasonal base
  dischargeHistory: number[];
  dischargeDates: string[];
  rainfallLast24h: number;
  rainfallHistory: number[];
  rainfallDates: string[];
}

function wqStatus(wqi: number): "Good" | "Moderate" | "Poor" | "Critical" {
  if (wqi >= 70) return "Good";
  if (wqi >= 50) return "Moderate";
  if (wqi >= 30) return "Poor";
  return "Critical";
}

/**
 * Deterministic water-quality estimate for the current window.
 * Uses observed hydrology (real discharge + rainfall) to perturb laboratory
 * baselines, emulating dilution dynamics — clearly labelled "estimated".
 */
export function estimateWaterQuality(req: WqRequest): WaterQualityEstimate {
  const baseline = RIVER_BASELINE[req.riverId] ?? RIVER_BASELINE["river-musi"];
  const baselineSeries = getMeasurementsByRiver(req.riverId, 45).map((m) => m.waterQualityIndex);

  // Dilution: higher discharge dilutes but also flushes accumulated waste.
  const ratio = Math.min(3, Math.max(0.2, req.dischargeRatio));
  const dilutionBoost = Math.min(18, (ratio - 1) * 16);

  // First-flush: after a dry spell, heavy rain scours pollutant load into the river.
  const dryDays = countConsecutiveDryDays(req.rainfallHistory, req.rainfallDates);
  const flushPenalty = req.rainfallLast24h > 12 && dryDays >= 5 ? Math.min(14, req.rainfallLast24h * 0.35) : 0;

  let wqi = baseline.wqiBase + dilutionBoost - flushPenalty;
  const seasonality = Math.sin((Date.now() / 86_400_000 / 365) * 2 * Math.PI) * 4;
  wqi += seasonality;

  const wqiFinal = Math.round(Math.min(95, Math.max(15, wqi)));

  const ph = round(Math.min(8.5, Math.max(6.2, baseline.phBase + (ratio - 1) * 0.05 - (flushPenalty > 5 ? 0.3 : 0))), 2);
  const dissolvedOxygen = round(Math.min(8.5, Math.max(0.5, baseline.doBase + dilutionBoost * 0.08 - flushPenalty * 0.1)), 2);
  const turbidity = round(Math.min(120, Math.max(5, baseline.turbBase - dilutionBoost * 0.4 + (req.rainfallLast24h > 8 ? req.rainfallLast24h * 0.6 : 0))), 2);
  const bod = round(Math.min(15, Math.max(1, baseline.bodBase - dilutionBoost * 0.12 + flushPenalty * 0.2)), 2);
  const cod = round(Math.min(90, Math.max(8, baseline.codBase - dilutionBoost * 0.7 + flushPenalty * 1.1)), 2);

  const anomalies = (
    baselineSeries.length >= 8
      ? detectAnomalies(
          baselineSeries,
          getMeasurementsByRiver(req.riverId, 45).map((m) => m.timestamp.split("T")[0]),
          "WQI"
        )
      : []
  ).map((a) => ({
    ...a,
    metric: "WQI",
    severity: a.severity as "Low" | "Moderate" | "High" | "Critical",
  }));

  const forecastBase = baselineSeries.length ? lastN(baselineSeries, 30) : [wqiFinal];
  const forecast = forecastSeries(forecastBase, 7).map((p) => ({
    date: futureDate(p.index - (forecastBase.length - 1)),
    wqi: round(Math.min(100, Math.max(10, p.value))),
    do: round(Math.min(9, Math.max(1, dissolvedOxygen + (p.value - wqiFinal) * 0.05))),
  }));

  return {
    wqi: wqiFinal,
    status: wqStatus(wqiFinal),
    ph,
    dissolvedOxygen,
    turbidity,
    bod,
    cod,
    anomalies,
    forecast7d: forecast,
  };
}

function countConsecutiveDryDays(values: number[], dates: string[]): number {
  let count = 0;
  for (let i = values.length - 1; i >= 0; i--) {
    if ((values[i] ?? 0) < 0.5) count++;
    else break;
  }
  return count;
}

function futureDate(daysFromNow: number): string {
  const d = new Date(Date.now() + daysFromNow * 86_400_000);
  return d.toISOString().split("T")[0];
}