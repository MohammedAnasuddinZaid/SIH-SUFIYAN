import { WaterMeasurement } from "../types";

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const RIVERS = [
  {
    id: "river-musi",
    zones: [
      { id: "zone-musi-04", phBase: 6.8, doBase: 4.2, turbBase: 28, bodBase: 5.2, codBase: 35, wqiBase: 42 },
      { id: "zone-musi-07", phBase: 7.0, doBase: 4.5, turbBase: 25, bodBase: 4.8, codBase: 32, wqiBase: 48 },
      { id: "zone-musi-01", phBase: 7.2, doBase: 6.8, turbBase: 12, bodBase: 2.5, codBase: 18, wqiBase: 78 },
      { id: "zone-musi-05", phBase: 7.1, doBase: 5.2, turbBase: 20, bodBase: 3.8, codBase: 25, wqiBase: 58 },
      { id: "zone-musi-09", phBase: 7.3, doBase: 6.2, turbBase: 15, bodBase: 2.8, codBase: 20, wqiBase: 68 },
    ],
  },
  {
    id: "river-ganga",
    zones: [
      { id: "zone-ganga-01", phBase: 7.4, doBase: 5.2, turbBase: 22, bodBase: 4.2, codBase: 28, wqiBase: 55 },
      { id: "zone-ganga-02", phBase: 7.5, doBase: 5.6, turbBase: 20, bodBase: 3.8, codBase: 25, wqiBase: 58 },
      { id: "zone-ganga-06", phBase: 7.3, doBase: 4.7, turbBase: 25, bodBase: 4.6, codBase: 30, wqiBase: 51 },
      { id: "zone-ganga-07", phBase: 7.4, doBase: 5.0, turbBase: 22, bodBase: 4.3, codBase: 29, wqiBase: 54 },
    ],
  },
  {
    id: "river-yamuna",
    zones: [
      { id: "zone-yamuna-01", phBase: 7.6, doBase: 3.1, turbBase: 32, bodBase: 6.8, codBase: 46, wqiBase: 36 },
      { id: "zone-yamuna-02", phBase: 7.6, doBase: 3.4, turbBase: 30, bodBase: 6.4, codBase: 43, wqiBase: 39 },
      { id: "zone-yamuna-03", phBase: 7.7, doBase: 3.0, turbBase: 34, bodBase: 7.1, codBase: 48, wqiBase: 34 },
    ],
  },
  {
    id: "river-godavari",
    zones: [
      { id: "zone-godavari-01", phBase: 7.2, doBase: 5.7, turbBase: 18, bodBase: 3.5, codBase: 22, wqiBase: 63 },
      { id: "zone-godavari-02", phBase: 7.1, doBase: 5.4, turbBase: 20, bodBase: 3.7, codBase: 25, wqiBase: 60 },
    ],
  },
  {
    id: "river-krishna",
    zones: [
      { id: "zone-krishna-01", phBase: 7.3, doBase: 5.6, turbBase: 19, bodBase: 3.6, codBase: 24, wqiBase: 61 },
      { id: "zone-krishna-02", phBase: 7.2, doBase: 5.3, turbBase: 21, bodBase: 3.8, codBase: 26, wqiBase: 58 },
    ],
  },
];

function generateMeasurements(): WaterMeasurement[] {
  const measurements: WaterMeasurement[] = [];
  const now = new Date();

  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    RIVERS.forEach((river) => {
      river.zones.forEach((zone, zoneIdx) => {
        const seed = dayOffset * 100 + zoneIdx * 17;
        const r1 = seededRandom(seed);
        const r2 = seededRandom(seed + 1);
        const r3 = seededRandom(seed + 2);
        const r4 = seededRandom(seed + 3);
        const r5 = seededRandom(seed + 4);
        const r6 = seededRandom(seed + 5);

        const ph = Math.round((zone.phBase + (r1 - 0.5) * 0.6) * 100) / 100;
        const dissolvedOxygen = Math.round((zone.doBase + (r2 - 0.5) * 1.2) * 100) / 100;
        const turbidity = Math.round((zone.turbBase + (r3 - 0.5) * 8) * 100) / 100;
        const bod = Math.round((zone.bodBase + (r4 - 0.5) * 1.5) * 100) / 100;
        const cod = Math.round((zone.codBase + (r5 - 0.5) * 10) * 100) / 100;
        const waterQualityIndex = Math.round((zone.wqiBase + (r6 - 0.5) * 10) * 100) / 100;

        measurements.push({
          id: `wm-${zone.id}-${dateStr}`,
          riverId: river.id,
          zoneId: zone.id,
          timestamp: `${dateStr}T08:00:00Z`,
          ph: Math.max(6.5, Math.min(8.5, ph)),
          dissolvedOxygen: Math.max(3.0, Math.min(7.5, dissolvedOxygen)),
          turbidity: Math.max(5, Math.min(45, turbidity)),
          bod: Math.max(1.5, Math.min(8, bod)),
          cod: Math.max(10, Math.min(60, cod)),
          waterQualityIndex: Math.max(25, Math.min(90, waterQualityIndex)),
        });
      });
    });
  }

  return measurements;
}

export const waterMeasurements: WaterMeasurement[] = generateMeasurements();

export function getMeasurementsByZone(zoneId: string, days: number = 90): WaterMeasurement[] {
  const cutoff = new Date("2026-09-09");
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  return waterMeasurements
    .filter((m) => m.zoneId === zoneId && m.timestamp >= cutoffStr)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function getMeasurementsByRiver(riverId: string, days: number = 90): WaterMeasurement[] {
  const cutoff = new Date("2026-09-09");
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  return waterMeasurements
    .filter((m) => m.riverId === riverId && m.timestamp >= cutoffStr)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}