export type DataStatus = "live" | "estimated" | "simulated";

export type FloodRiskLevel = "Low" | "Moderate" | "High" | "Critical";

export interface DataSourceInfo {
  key: string;
  name: string;
  status: DataStatus;
  isLive: boolean;
  updatedAt: string | null;
  note?: string;
  license?: string;
}

export interface TimePoint {
  date: string;
  value: number;
}

export interface DischargeSeries {
  current: number;
  unit: string;
  history: TimePoint[];
  forecast: {
    date: string;
    min: number;
    mean: number;
    max: number;
  }[];
  peakDay?: string;
  peakRatio?: number;
}

export interface RainfallSeries {
  last24h: number;
  unit: string;
  history: TimePoint[];
  forecast: TimePoint[];
}

export interface FloodRisk {
  level: FloodRiskLevel;
  score: number;
  drivers: string[];
  leadTimeHours: number;
  /** Self-calibrated reference levels derived from the observed window */
  stageRef?: {
    floodMark: number;
    dangerMark: number;
    envelope: number;
  };
}

export interface WaterQualityEstimate {
  wqi: number;
  status: "Good" | "Moderate" | "Poor" | "Critical";
  ph: number;
  dissolvedOxygen: number;
  turbidity: number;
  bod: number;
  cod: number;
  anomalies: {
    date: string;
    metric: string;
    value: number;
    expected: number;
    deviation: number;
    severity: "Low" | "Moderate" | "High" | "Critical";
  }[];
  forecast7d: {
    date: string;
    wqi: number;
    do: number;
  }[];
}

export interface ZoneLiveReading {
  zoneId: string;
  riverId: string;
  floodRisk: FloodRiskLevel;
  rainfallLast24hMm: number;
  wqiEstimate: number;
  liveEvent?: boolean;
}

export interface RiverLiveData {
  riverId: string;
  riverName: string;
  gauge: { lat: number; lon: number };
  discharge: DischargeSeries;
  rainfall: RainfallSeries;
  floodRisk: FloodRisk;
  waterQuality: WaterQualityEstimate;
  updatedAt: string;
}

export interface LiveSnapshot {
  generatedAt: string;
  sources: DataSourceInfo[];
  rivers: RiverLiveData[];
  zones: ZoneLiveReading[];
  mode: "live" | "hybrid" | "simulated";
}