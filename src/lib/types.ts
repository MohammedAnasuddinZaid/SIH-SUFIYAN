// Severity levels
export type Severity = "Low" | "Moderate" | "High" | "Critical";

// Risk levels
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

// Priority levels
export type Priority = "Low" | "Medium" | "High" | "Urgent";

// Report statuses
export type ReportStatus = 
  | "submitted" 
  | "triaged" 
  | "assigned" 
  | "in_progress" 
  | "awaiting_verification" 
  | "resolved";

// Action statuses
export type ActionStatus = 
  | "planned" 
  | "assigned" 
  | "in_progress" 
  | "completed" 
  | "awaiting_verification";

// Pollution types
export type PollutionType = 
  | "Industrial" 
  | "Domestic Sewage" 
  | "Plastic" 
  | "Agricultural" 
  | "Mixed" 
  | "Organic"
  | "Chemical"
  | "Oil Spill";

// Waste categories
export type WasteCategory = 
  | "Plastic" 
  | "Organic" 
  | "Industrial" 
  | "Sewage" 
  | "Mixed" 
  | "Metal" 
  | "Glass" 
  | "Electronic";

// Health status
export type HealthStatus = "Critical" | "Poor" | "Fair" | "Good" | "Excellent";

// Trend direction
export type TrendDirection = "up" | "down" | "stable";

// River model
export interface River {
  id: string;
  name: string;
  displayName: string;
  description: string;
  region: string;
  healthScore: number;
  healthStatus: HealthStatus;
}

// Monitoring Zone model
export interface MonitoringZone {
  id: string;
  riverId: string;
  name: string;
  latitude: number;
  longitude: number;
  pollutionLevel: number;
  waterQualityScore: number;
  primaryWaste: string;
  riskLevel: RiskLevel;
  lastInspection: string;
  recommendedAction: string;
}

// Water Measurement model
export interface WaterMeasurement {
  id: string;
  riverId: string;
  zoneId: string;
  timestamp: string;
  ph: number;
  dissolvedOxygen: number;
  turbidity: number;
  bod: number;
  cod: number;
  waterQualityIndex: number;
}

// Waste Record model
export interface WasteRecord {
  id: string;
  riverId: string;
  zoneId: string;
  category: WasteCategory;
  weightKg: number;
  confidence: number;
  detectedAt: string;
  disposalRecommendation: string;
}

// Pollution Report model
export interface PollutionReport {
  id: string;
  reportNumber: string;
  riverId: string;
  location: string;
  latitude: number;
  longitude: number;
  pollutionType: PollutionType;
  description: string;
  severity: Severity;
  status: ReportStatus;
  submittedAt: string;
  reporterName: string;
  assignedTo?: string;
}

// Action model
export interface Action {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: ActionStatus;
  dueDate: string;
  assignedTeam: string;
  relatedReportId?: string;
  zoneId: string;
}

// Impact Metric model
export interface ImpactMetric {
  id: string;
  metric: string;
  value: number | string;
  unit: string;
  period: string;
}

// Pollution Source model
export interface PollutionSource {
  id: string;
  source: string;
  risk: RiskLevel;
  confidence: number;
  affectedZones: string[];
  incidentCount: number;
  trend: TrendDirection;
  evidence: string;
}

// Anomaly model
export interface Anomaly {
  id: string;
  metric: string;
  entityId: string;
  observedValue: number;
  expectedValue: number;
  deviation: number;
  severity: Severity;
  detectedAt: string;
}

// Recommendation model
export interface Recommendation {
  id: string;
  type: string;
  title: string;
  summary: string;
  priority: Priority;
  confidence: number;
  signals: string[];
  zoneId: string;
}

// Water Parameter Summary
export interface WaterParameterSummary {
  parameter: string;
  value: number;
  unit: string;
  status: "Good" | "Moderate" | "Poor" | "Critical";
  trend: TrendDirection;
}

// Zone Statistics
export interface ZoneStats {
  total: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// River Summary
export interface RiverSummary {
  riverId: string;
  averageWQI: number;
  averageDO: number;
  averagePH: number;
  totalWaste: number;
  highRiskZones: number;
  activeReports: number;
}

// Waste Composition
export interface WasteComposition {
  category: WasteCategory;
  weightKg: number;
  percentage: number;
}

// Trend Data Point
export interface TrendDataPoint {
  date: string;
  value: number;
}

// Pollution Trend Data Point
export interface PollutionTrendDataPoint {
  date: string;
  plastic: number;
  sewage: number;
  industrial: number;
  organic: number;
}
