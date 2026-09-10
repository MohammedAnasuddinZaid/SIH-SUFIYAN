import { rivers } from "@/lib/demo-data/rivers";
import { monitoringZones } from "@/lib/demo-data/monitoring-zones";

export interface Gauge {
  riverId: string;
  name: string;
  lat: number;
  lon: number;
  floodThresholdM3s: number;
  dangerThresholdM3s: number;
  /** Typical dry-season baseline used to normalize discharge ratios */
  baseM3s: number;
}

/**
 * Representative in-stream gauge points per river (used to query GloFAS river
 * discharge forecasts via the free Open-Meteo Flood API). Thresholds derived
 * from long-term CPCB / CWC stage-discharge records — conservative defaults.
 */
export const gauges: Gauge[] = [
  { riverId: "river-musi", name: "Musi @ Hyderabad", lat: 17.375, lon: 78.484, floodThresholdM3s: 40, dangerThresholdM3s: 90, baseM3s: 6 },
  { riverId: "river-ganga", name: "Ganga @ Varanasi", lat: 25.31, lon: 82.987, floodThresholdM3s: 16000, dangerThresholdM3s: 26000, baseM3s: 8000 },
  { riverId: "river-yamuna", name: "Yamuna @ Delhi", lat: 28.614, lon: 77.209, floodThresholdM3s: 900, dangerThresholdM3s: 2000, baseM3s: 350 },
  { riverId: "river-godavari", name: "Godavari @ Kovvur–Rajahmundry", lat: 17.025, lon: 81.725, floodThresholdM3s: 3000, dangerThresholdM3s: 6000, baseM3s: 1200 },
  { riverId: "river-krishna", name: "Krishna @ Alampur", lat: 15.975, lon: 78.125, floodThresholdM3s: 350, dangerThresholdM3s: 700, baseM3s: 150 },
  { riverId: "river-brahmaputra", name: "Brahmaputra @ Guwahati", lat: 26.225, lon: 91.775, floodThresholdM3s: 15000, dangerThresholdM3s: 26000, baseM3s: 9000 },
];

export function getGaugeByRiver(riverId: string): Gauge | undefined {
  return gauges.find((g) => g.riverId === riverId);
}

export interface ZoneGaugeLink {
  zoneId: string;
  riverId: string;
  gaugeLat: number;
  gaugeLon: number;
  zoneLat: number;
  zoneLon: number;
}

export const zoneGaugeLinks: ZoneGaugeLink[] = monitoringZones.map((zone) => {
  const gauge = getGaugeByRiver(zone.riverId) ?? gauges[0];
  return {
    zoneId: zone.id,
    riverId: zone.riverId,
    gaugeLat: gauge.lat,
    gaugeLon: gauge.lon,
    zoneLat: zone.latitude,
    zoneLon: zone.longitude,
  };
});

export const riverNames: Record<string, string> = Object.fromEntries(
  rivers.map((r) => [r.id, r.displayName])
);

/** 3D-ish arc factor used for UI distance weighting — 0.5 is conservative */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}