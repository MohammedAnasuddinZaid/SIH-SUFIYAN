import { PollutionSource, Anomaly, Recommendation } from "../types";

export const pollutionSources: PollutionSource[] = [
  { id: "src-001", source: "Plastic Dumping", risk: "High", confidence: 84, affectedZones: ["zone-musi-04", "zone-musi-05", "zone-musi-06"], incidentCount: 18, trend: "up", evidence: "AI satellite imagery analysis" },
  { id: "src-002", source: "Domestic Sewage", risk: "High", confidence: 78, affectedZones: ["zone-musi-03", "zone-musi-06", "zone-musi-08"], incidentCount: 12, trend: "stable", evidence: "Water quality sensor data" },
  { id: "src-003", source: "Industrial Discharge", risk: "Medium", confidence: 72, affectedZones: ["zone-musi-07", "zone-musi-08"], incidentCount: 7, trend: "down", evidence: "Factory inspection reports" },
  { id: "src-004", source: "Agricultural Runoff", risk: "Low", confidence: 65, affectedZones: ["zone-musi-11", "zone-musi-12"], incidentCount: 4, trend: "stable", evidence: "Seasonal pattern analysis" },
  { id: "src-005", source: "Solid Waste Dumping", risk: "High", confidence: 81, affectedZones: ["zone-musi-04", "zone-musi-05"], incidentCount: 15, trend: "up", evidence: "Waste volume tracking" },
];

export const anomalies: Anomaly[] = [
  { id: "anom-001", metric: "Plastic Waste", entityId: "zone-musi-04", observedValue: 420, expectedValue: 200, deviation: 2.1, severity: "Critical", detectedAt: "2026-09-08T10:15:00Z" },
  { id: "anom-002", metric: "Industrial Waste", entityId: "zone-musi-07", observedValue: 380, expectedValue: 150, deviation: 2.53, severity: "High", detectedAt: "2026-09-07T12:30:00Z" },
  { id: "anom-003", metric: "Water Quality Index", entityId: "zone-musi-09", observedValue: 58, expectedValue: 68, deviation: 0.85, severity: "Moderate", detectedAt: "2026-09-06T08:45:00Z" },
];

export const recommendations: Recommendation[] = [
  { id: "rec-001", type: "Cleanup", title: "Prioritize Zone 04 Cleanup", summary: "Immediate cleanup required for Zone 04 due to 2.1x plastic waste above baseline. High community impact.", priority: "Urgent", confidence: 92, signals: ["plastic_accumulation", "community_reports", "satellite_data"], zoneId: "zone-musi-04" },
  { id: "rec-002", type: "Investigation", title: "Investigate Zone 07 Industrial Source", summary: "Industrial waste spike detected. Identify and address discharge sources to prevent further contamination.", priority: "High", confidence: 85, signals: ["industrial_spike", "sensor_anomaly", "factory_reports"], zoneId: "zone-musi-07" },
  { id: "rec-003", type: "Monitoring", title: "Increase Monitoring Frequency", summary: "Increase water sampling and sensor monitoring in high-risk zones to track pollution trends.", priority: "Medium", confidence: 78, signals: ["trend_analysis", "risk_assessment", "coverage_gaps"], zoneId: "zone-musi-04" },
  { id: "rec-004", type: "Outreach", title: "Community Outreach in Zone 09", summary: "Organize awareness programs to educate local communities about waste management and river protection.", priority: "Medium", confidence: 72, signals: ["community_engagement", "waste_patterns", "local_feedback"], zoneId: "zone-musi-09" },
  { id: "rec-005", type: "Sampling", title: "Water Sampling at Zone 11", summary: "Conduct detailed water sampling to assess agricultural runoff impact and establish baseline parameters.", priority: "Low", confidence: 68, signals: ["seasonal_patterns", "agricultural_activity", "water_parameters"], zoneId: "zone-musi-11" },
];

export function getPollutionSourceById(id: string): PollutionSource | undefined {
  return pollutionSources.find((s) => s.id === id);
}

export function getAnomaliesByZone(zoneId: string): Anomaly[] {
  return anomalies.filter((a) => a.entityId === zoneId);
}

export function getRecommendationsByZone(zoneId: string): Recommendation[] {
  return recommendations.filter((r) => r.zoneId === zoneId);
}
