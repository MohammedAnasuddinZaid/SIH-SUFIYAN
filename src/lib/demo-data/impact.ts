import { ImpactMetric } from "../types";

export const impactMetrics: ImpactMetric[] = [
  { id: "impact-001", metric: "Waste Removed", value: 2840, unit: "kg", period: "Last 90 days" },
  { id: "impact-002", metric: "Pollution Reports", value: 426, unit: "reports", period: "Last 90 days" },
  { id: "impact-003", metric: "Issues Resolved", value: 318, unit: "issues", period: "Last 90 days" },
  { id: "impact-004", metric: "Monitoring Zones", value: 32, unit: "zones", period: "Current" },
  { id: "impact-005", metric: "Communities Engaged", value: 18, unit: "communities", period: "Last 90 days" },
  { id: "impact-006", metric: "Cleanup Actions", value: 156, unit: "actions", period: "Last 90 days" },
  { id: "impact-007", metric: "Resolution Rate", value: 74.6, unit: "%", period: "Last 90 days" },
  { id: "impact-008", metric: "Average Response Time", value: 18.4, unit: "hours", period: "Last 90 days" },
  { id: "impact-009", metric: "SLA Compliance", value: 82, unit: "%", period: "Last 90 days" },
];

export function getImpactMetric(metricName: string): ImpactMetric | undefined {
  return impactMetrics.find((m) => m.metric === metricName);
}
