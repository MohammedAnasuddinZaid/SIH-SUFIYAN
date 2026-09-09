import { rivers } from "./demo-data/rivers";
import { monitoringZones, getZonesByRiver } from "./demo-data/monitoring-zones";
import { waterMeasurements, getMeasurementsByRiver } from "./demo-data/water-measurements";
import { wasteRecords } from "./demo-data/waste";
import { pollutionReports } from "./demo-data/reports";
import { actions } from "./demo-data/actions";
import { pollutionSources, anomalies, recommendations } from "./demo-data/analytics";
import { impactMetrics } from "./demo-data/impact";
import { River, MonitoringZone, WaterMeasurement, WasteRecord, PollutionReport, Action, PollutionSource, Anomaly, Recommendation, ImpactMetric, Severity, RiskLevel, HealthStatus, TrendDirection, WasteCategory, WaterParameterSummary, ZoneStats, RiverSummary, WasteComposition, TrendDataPoint, PollutionTrendDataPoint } from "./types";

export function getRiverById(riverId: string): River | undefined {
  return rivers.find((river) => river.id === riverId);
}

export function getZonesByRiverSelector(riverId: string): MonitoringZone[] {
  return monitoringZones.filter((zone) => zone.riverId === riverId);
}

export function getRiverHealthScore(riverId: string): number {
  const zones = getZonesByRiverSelector(riverId);
  if (zones.length === 0) return 0;
  const totalWQI = zones.reduce((sum, zone) => sum + zone.waterQualityScore, 0);
  return Math.round(totalWQI / zones.length);
}

export function getRiverSummary(riverId: string): RiverSummary {
  const zones = getZonesByRiverSelector(riverId);
  const riverMeasurements = waterMeasurements.filter((m) => m.riverId === riverId);
  const riverWaste = wasteRecords.filter((w) => w.riverId === riverId);
  const riverReports = pollutionReports.filter((r) => r.riverId === riverId);

  const averageWQI = zones.length > 0 
    ? Math.round(zones.reduce((sum, z) => sum + z.waterQualityScore, 0) / zones.length) 
    : 0;

  const averageDO = riverMeasurements.length > 0 
    ? Math.round((riverMeasurements.reduce((sum, m) => sum + m.dissolvedOxygen, 0) / riverMeasurements.length) * 100) / 100 
    : 0;

  const averagePH = riverMeasurements.length > 0 
    ? Math.round((riverMeasurements.reduce((sum, m) => sum + m.ph, 0) / riverMeasurements.length) * 100) / 100 
    : 0;

  const totalWaste = riverWaste.reduce((sum, w) => sum + w.weightKg, 0);
  const highRiskZones = zones.filter((z) => z.riskLevel === "High" || z.riskLevel === "Critical").length;
  const activeReports = riverReports.filter((r) => r.status !== "resolved").length;

  return {
    riverId,
    averageWQI,
    averageDO,
    averagePH,
    totalWaste,
    highRiskZones,
    activeReports,
  };
}

export function getWaterQualityTrend(riverId: string, days: number): TrendDataPoint[] {
  const measurements = getMeasurementsByRiver(riverId, days);
  const zoneMap = new Map<string, WaterMeasurement[]>();

  measurements.forEach((m) => {
    const existing = zoneMap.get(m.zoneId) || [];
    existing.push(m);
    zoneMap.set(m.zoneId, existing);
  });

  const dateMap = new Map<string, number[]>();
  measurements.forEach((m) => {
    const date = m.timestamp.split("T")[0];
    const existing = dateMap.get(date) || [];
    existing.push(m.waterQualityIndex);
    dateMap.set(date, existing);
  });

  const result: TrendDataPoint[] = [];
  dateMap.forEach((values, date) => {
    const avg = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100;
    result.push({ date, value: avg });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export function getPollutionTrend(riverId: string, days: number): PollutionTrendDataPoint[] {
  const measurements = getMeasurementsByRiver(riverId, days);
  const wasteByDate = new Map<string, { plastic: number; sewage: number; industrial: number; organic: number }>();

  const riverWaste = wasteRecords.filter((w) => w.riverId === riverId);
  riverWaste.forEach((w) => {
    const date = w.detectedAt.split("T")[0];
    const existing = wasteByDate.get(date) || { plastic: 0, sewage: 0, industrial: 0, organic: 0 };

    if (w.category === "Plastic") existing.plastic += w.weightKg;
    else if (w.category === "Sewage") existing.sewage += w.weightKg;
    else if (w.category === "Industrial") existing.industrial += w.weightKg;
    else if (w.category === "Organic") existing.organic += w.weightKg;

    wasteByDate.set(date, existing);
  });

  const result: PollutionTrendDataPoint[] = [];
  wasteByDate.forEach((values, date) => {
    result.push({ date, ...values });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export function getWasteComposition(riverId: string): WasteComposition[] {
  const riverWaste = wasteRecords.filter((w) => w.riverId === riverId);
  const totalWeight = riverWaste.reduce((sum, w) => sum + w.weightKg, 0);

  const categoryMap = new Map<WasteCategory, number>();
  riverWaste.forEach((w) => {
    const existing = categoryMap.get(w.category) || 0;
    categoryMap.set(w.category, existing + w.weightKg);
  });

  const result: WasteComposition[] = [];
  categoryMap.forEach((weight, category) => {
    result.push({
      category,
      weightKg: weight,
      percentage: Math.round((weight / totalWeight) * 10000) / 100,
    });
  });

  return result.sort((a, b) => b.weightKg - a.weightKg);
}

export function getWaterParameterSummary(riverId: string): WaterParameterSummary[] {
  const measurements = waterMeasurements.filter((m) => m.riverId === riverId);
  if (measurements.length === 0) return [];

  const recentMeasurements = measurements.slice(-50);

  const avgPH = recentMeasurements.reduce((s, m) => s + m.ph, 0) / recentMeasurements.length;
  const avgDO = recentMeasurements.reduce((s, m) => s + m.dissolvedOxygen, 0) / recentMeasurements.length;
  const avgTurbidity = recentMeasurements.reduce((s, m) => s + m.turbidity, 0) / recentMeasurements.length;
  const avgBOD = recentMeasurements.reduce((s, m) => s + m.bod, 0) / recentMeasurements.length;
  const avgCOD = recentMeasurements.reduce((s, m) => s + m.cod, 0) / recentMeasurements.length;

  return [
    { parameter: "pH", value: Math.round(avgPH * 100) / 100, unit: "", status: avgPH >= 6.5 && avgPH <= 8.5 ? "Good" : "Moderate", trend: "stable" },
    { parameter: "Dissolved Oxygen", value: Math.round(avgDO * 100) / 100, unit: "mg/L", status: avgDO >= 6 ? "Good" : avgDO >= 4 ? "Moderate" : "Poor", trend: "down" },
    { parameter: "Turbidity", value: Math.round(avgTurbidity * 100) / 100, unit: "NTU", status: avgTurbidity <= 15 ? "Good" : avgTurbidity <= 25 ? "Moderate" : "Poor", trend: "up" },
    { parameter: "BOD", value: Math.round(avgBOD * 100) / 100, unit: "mg/L", status: avgBOD <= 3 ? "Good" : avgBOD <= 5 ? "Moderate" : "Poor", trend: "stable" },
    { parameter: "COD", value: Math.round(avgCOD * 100) / 100, unit: "mg/L", status: avgCOD <= 25 ? "Good" : avgCOD <= 35 ? "Moderate" : "Poor", trend: "stable" },
  ];
}

export function getMonitoringZoneStats(riverId: string): ZoneStats {
  const zones = getZonesByRiverSelector(riverId);
  return {
    total: zones.length,
    low: zones.filter((z) => z.riskLevel === "Low").length,
    medium: zones.filter((z) => z.riskLevel === "Medium").length,
    high: zones.filter((z) => z.riskLevel === "High").length,
    critical: zones.filter((z) => z.riskLevel === "Critical").length,
  };
}

export function getPollutionSourceSummary(riverId: string): PollutionSource[] {
  const zones = getZonesByRiverSelector(riverId);
  const zoneIds = zones.map((z) => z.id);
  return pollutionSources.filter((s) => s.affectedZones.some((z) => zoneIds.includes(z)));
}

export function getActiveReportCount(riverId: string): number {
  return pollutionReports.filter((r) => r.riverId === riverId && r.status !== "resolved").length;
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case "Low":
      return "bg-green-100 text-green-800";
    case "Moderate":
      return "bg-yellow-100 text-yellow-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case "Low":
      return "bg-green-100 text-green-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getHealthStatus(score: number): HealthStatus {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}

export function calculateTrendDirection(values: number[]): TrendDirection {
  if (values.length < 2) return "stable";

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (change > 5) return "up";
  if (change < -5) return "down";
  return "stable";
}
