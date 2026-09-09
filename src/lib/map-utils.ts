import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { MonitoringZone, PollutionReport, RiskLevel } from "./types";

interface ZoneProperties {
  id: string;
  zoneName: string;
  pollutionLevel: number;
  waterQualityScore: number;
  primaryWaste: string;
  riskLevel: RiskLevel;
  lastInspection: string;
}

export function riskToHex(risk: string): string {
  switch (risk) {
    case "Low":
      return "#16a34a";
    case "Medium":
      return "#eab308";
    case "High":
      return "#f97316";
    case "Critical":
      return "#dc2626";
    default:
      return "#64748b";
  }
}

export function monitoringZonesToGeoJSON(
  zones: MonitoringZone[]
): FeatureCollection<Geometry, ZoneProperties> {
  return {
    type: "FeatureCollection",
    features: zones.map(
      (zone): Feature<Geometry, ZoneProperties> => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [zone.longitude, zone.latitude],
        },
        properties: {
          id: zone.id,
          zoneName: zone.name,
          pollutionLevel: zone.pollutionLevel,
          waterQualityScore: zone.waterQualityScore,
          primaryWaste: zone.primaryWaste,
          riskLevel: zone.riskLevel,
          lastInspection: zone.lastInspection,
        },
      })
    ),
  };
}

export function riverPathToGeoJSON(
  zones: MonitoringZone[]
): Feature<Geometry, Record<string, never>> {
  const sorted = [...zones].sort(
    (a, b) => a.latitude - b.latitude || a.longitude - b.longitude
  );
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: sorted.map((z) => [z.longitude, z.latitude]),
    },
    properties: {},
  };
}

export function reportsToGeoJSON(
  reports: PollutionReport[]
): FeatureCollection<Geometry, Record<string, string | number>> {
  return {
    type: "FeatureCollection",
    features: reports.map(
      (report): Feature<Geometry, Record<string, string | number>> => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [report.longitude, report.latitude],
        },
        properties: {
          id: report.id,
          reportNumber: report.reportNumber,
          location: report.location,
          pollutionType: report.pollutionType,
          description: report.description,
          severity: report.severity,
          status: report.status,
          reporterName: report.reporterName,
          submittedAt: report.submittedAt,
        },
      })
    ),
  };
}
