export function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function lastN(values: number[], n: number): number[] {
  return values.slice(-n);
}

export function movingAverage(values: number[], window: number): number[] {
  const out: number[] = [];
  let acc = 0;
  const queue: number[] = [];
  for (const v of values) {
    queue.push(v);
    acc += v;
    if (queue.length > window) acc -= queue.shift() as number;
    out.push(acc / queue.length);
  }
  return out;
}

export interface TrendFit {
  slope: number;
  intercept: number;
  r2: number;
}

/** Least-squares linear fit over (index, value) */
export function linearFit(values: number[]): TrendFit {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0, r2: 1 };
  const xs = values.map((_, i) => i);
  const mx = mean(xs);
  const my = mean(values);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (values[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * xs[i];
    ssRes += (values[i] - predicted) ** 2;
    ssTot += (values[i] - my) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

export interface ForecastPoint {
  index: number;
  value: number;
  lower: number;
  upper: number;
}

/**
 * Extends a time series `n` steps using a damped linear trend blended with the
 * recent moving average. Produces confidence bands from residual noise.
 */
export function forecastSeries(values: number[], steps: number): ForecastPoint[] {
  const n = values.length;
  if (n < 4) {
    const last = values[n - 1] ?? 0;
    return Array.from({ length: steps }, (_, i) => ({
      index: n - 1 + i,
      value: last,
      lower: last,
      upper: last,
    }));
  }
  const fit = linearFit(values);
  const recent = lastN(values, Math.min(7, n));
  const recentMean = mean(recent);
  const residual = stdDev(values.slice(-Math.min(14, n)));
  const damp = Math.max(0, Math.min(0.4, fit.slope / (Math.abs(recentMean) + 1e-6) * 3));

  const out: ForecastPoint[] = [];
  let lastValue = values[n - 1];
  for (let i = 1; i <= steps; i++) {
    const trendStep = fit.slope * Math.exp(-0.25 * (i - 1));
    const meanRegress = (recentMean - lastValue) * 0.15;
    const next = lastValue + trendStep + meanRegress;
    const band = residual * (0.6 + 0.4 * i);
    out.push({ index: n - 1 + i, value: next, lower: next - band, upper: next + band });
    lastValue = next;
  }
  void damp;
  return out;
}

/** Robust z-score anomaly detection (median-based, resistant to outliers) */
export function detectAnomalies(
  values: number[],
  dates: string[],
  metric: string,
  threshold = 3.5
): { date: string; value: number; expected: number; deviation: number; severity: string }[] {
  if (values.length < 8) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const deviations = values.map((v) => Math.abs(v - median));
  const mad = medianOf(deviations);
  const scale = mad === 0 ? stdDev(values) : 1.4826 * mad;

  const out: { date: string; value: number; expected: number; deviation: number; severity: string }[] = [];
  for (let i = 0; i < values.length; i++) {
    if (scale === 0) continue;
    const z = Math.abs(values[i] - median) / scale;
    if (z > threshold) {
      const pct = Math.round(((values[i] - median) / Math.abs(median || 1)) * 100);
      const severity = Math.abs(pct) >= 50 ? "Critical" : Math.abs(pct) >= 30 ? "High" : Math.abs(pct) >= 15 ? "Moderate" : "Low";
      out.push({
        date: dates[i] ?? "",
        value: Math.round(values[i] * 100) / 100,
        expected: Math.round(median * 100) / 100,
        deviation: Math.round(pct),
        severity,
      });
    }
  }
  return out;
}

function medianOf(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 2): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10 ** digits) / 10 ** digits;
}