import type { FloodRisk, FloodRiskLevel, TimePoint } from "@/lib/pipeline/types";
import { linearFit, mean, round } from "./statistics";

export interface FloodInput {
  gaugeId: string;
  history: number[]; // observed daily discharge m3/s (newest last)
  forecastMean: number[];
  forecastMax: number[];
  dates: string[];
  rainfallLast24h: number;
  baseM3s: number;
  floodThresholdM3s: number;
  dangerThresholdM3s: number;
}

function levelFromScore(score: number): FloodRiskLevel {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 30) return "Moderate";
  return "Low";
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
  return sorted[idx];
}

/**
 * Self-calibrating flood-risk score (0-100). Because ECMWF/GloFAS discharge is
 * a gridded simulation that can differ from in-situ gauge magnitudes, stage
 * thresholds are derived from each river's own observed envelope (percentiles
 * of the trailing ~45-day series) rather than fixed stage record values:
 *  - stage position vs P90/P97.5 of the observed window (50%)
 *  - rising-limb momentum vs the seasonal median (25%)
 *  - forecast peak vs the same envelope (15%)
 *  - antecedent 24-72h rainfall (10%)
 */
export function computeFloodRisk(input: FloodInput): FloodRisk {
  const now = input.history[input.history.length - 1] ?? 0;
  const sorted = [...input.history].sort((a, b) => a - b);

  const median = percentile(sorted, 0.5);
  const floodMark = Math.max(percentile(sorted, 0.8), input.floodThresholdM3s * 0.5);
  const dangerMark = Math.max(percentile(sorted, 0.95), floodMark * 1.15);
  const envelope = Math.max(percentile(sorted, 0.99), dangerMark);
  const base = Math.max(input.baseM3s, median, 1);

  // 1) Stage position (grid-scale, self-calibrated danger level). Guard against
  //    zero/NaN thresholds from empty or degenerate windows.
  const gh = (v: number) => (Number.isFinite(v) ? v : 0);
  const nowG = gh(now);
  const floodMarkG = gh(floodMark);
  const dangerMarkG = gh(dangerMark);
  let stageScore = 0;
  if (nowG >= dangerMarkG) {
    stageScore = 100;
  } else if (nowG >= floodMarkG) {
    stageScore = 75 + (25 * (nowG - floodMarkG)) / Math.max(1, dangerMarkG - floodMarkG);
  } else {
    stageScore = (nowG / Math.max(1, floodMarkG)) * 70;
  }

  // 2) Momentum — rise over the trailing week vs seasonal median
  const momentum = input.history.length >= 8 ? (nowG - median) / (base || 1) : 0;
  const momentumScore = Number.isFinite(momentum) ? Math.min(100, Math.max(0, momentum * 9)) : 0;

  // 3) Forecast peak pressure against the observed envelope
  const maxForecastPeak = Math.max(0, ...input.forecastMax.filter(Number.isFinite));
  let forecastScore = 0;
  if (maxForecastPeak >= dangerMarkG) forecastScore = 95;
  else if (maxForecastPeak >= floodMarkG) {
    forecastScore = 65 + (30 * (maxForecastPeak - floodMarkG)) / Math.max(1, dangerMarkG - floodMarkG);
  } else {
    forecastScore = (maxForecastPeak / Math.max(1, floodMarkG)) * 55;
  }

  // 4) Rainfall influence
  const rainScore = Number.isFinite(input.rainfallLast24h)
    ? Math.min(100, (Math.max(0, input.rainfallLast24h) / 80) * 100)
    : 0;

  const score = round(
    stageScore * 0.5 + momentumScore * 0.25 + forecastScore * 0.15 + rainScore * 0.1
  );

  const drivers: string[] = [];
  if (score >= 50) drivers.push("discharge_above_flood_stage");
  if (momentum > 0.5) drivers.push("rapid_rise_in_discharge");
  if (momentum > 0.12) drivers.push("rising_discharge_trend");
  if (Number.isFinite(input.rainfallLast24h) && input.rainfallLast24h > 25) drivers.push("heavy_recent_rainfall");
  if (maxForecastPeak >= floodMark) drivers.push("flood_peak_in_forecast");
  if (drivers.length === 0) drivers.push("within_seasonal_norm");

  return {
    level: levelFromScore(score),
    score,
    drivers: drivers.slice(0, 3),
    leadTimeHours: 24,
    stageRef: {
      floodMark: round(floodMark),
      dangerMark: round(dangerMark),
      envelope: round(envelope),
    },
  };
}

export interface FloodTrendPoint {
  date: string;
  observed: number;
  mean: number | null;
  max: number | null;
}

export function buildDischargeSeries(
  historyDates: string[],
  history: number[],
  forecastDates: string[],
  forecastMean: number[],
  forecastMin: number[],
  forecastMax: number[]
) {
  const current = round(history[history.length - 1] ?? 0);
  const unit = "m³/s";

  const historyPoints: TimePoint[] = historyDates.map((d, i) => ({
    date: d,
    value: round(history[i] ?? 0),
  }));

  const forecast = forecastDates.map((d, i) => ({
    date: d,
    min: round(forecastMin[i] ?? 0),
    mean: round(forecastMean[i] ?? 0),
    max: round(forecastMax[i] ?? 0),
  }));

  const allMeans = [...history, ...forecastMean];
  const peakValue = Math.max(...allMeans);
  const peakDay = forecastDates[forecastMean.indexOf(Math.max(...forecastMean))];
  return {
    current,
    unit,
    history: historyPoints,
    forecast,
    peakDay,
    peakRatio: round(peakValue / Math.max(1, current)),
  };
}

export function anomalyFlags(history: number[], dates: string[]): TimePoint[] {
  const fit = linearFit(history);
  return history.map((v, i) => {
    const predicted = fit.intercept + fit.slope * i;
    return { date: dates[i] ?? "", value: round(v - predicted) };
  });
}

export function percentChange(series: number[]): number {
  if (series.length < 2) return 0;
  const older = mean(series.slice(0, Math.min(7, series.length)));
  const newer = mean(series.slice(-Math.min(7, series.length)));
  if (older === 0) return 0;
  return round(((newer - older) / older) * 100);
}