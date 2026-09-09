import { WasteRecord } from "../types";

export const wasteRecords: WasteRecord[] = [
  // Zone 04 - High plastic waste
  { id: "waste-001", riverId: "river-musi", zoneId: "zone-musi-04", category: "Plastic", weightKg: 420, confidence: 92, detectedAt: "2026-09-08T10:15:00Z", disposalRecommendation: "Recycling facility" },
  { id: "waste-002", riverId: "river-musi", zoneId: "zone-musi-04", category: "Plastic", weightKg: 380, confidence: 88, detectedAt: "2026-09-07T14:22:00Z", disposalRecommendation: "Recycling facility" },
  { id: "waste-003", riverId: "river-musi", zoneId: "zone-musi-04", category: "Sewage", weightKg: 320, confidence: 85, detectedAt: "2026-09-06T09:30:00Z", disposalRecommendation: "Sewage treatment plant" },
  { id: "waste-004", riverId: "river-musi", zoneId: "zone-musi-04", category: "Mixed", weightKg: 280, confidence: 78, detectedAt: "2026-09-05T16:45:00Z", disposalRecommendation: "Waste segregation facility" },
  { id: "waste-005", riverId: "river-musi", zoneId: "zone-musi-04", category: "Industrial", weightKg: 150, confidence: 82, detectedAt: "2026-09-04T11:20:00Z", disposalRecommendation: "Hazardous waste facility" },

  // Zone 07 - Industrial waste
  { id: "waste-006", riverId: "river-musi", zoneId: "zone-musi-07", category: "Industrial", weightKg: 380, confidence: 90, detectedAt: "2026-09-08T08:10:00Z", disposalRecommendation: "Hazardous waste facility" },
  { id: "waste-007", riverId: "river-musi", zoneId: "zone-musi-07", category: "Industrial", weightKg: 290, confidence: 87, detectedAt: "2026-09-07T12:30:00Z", disposalRecommendation: "Hazardous waste facility" },
  { id: "waste-008", riverId: "river-musi", zoneId: "zone-musi-07", category: "Metal", weightKg: 180, confidence: 85, detectedAt: "2026-09-06T15:40:00Z", disposalRecommendation: "Metal recycling facility" },
  { id: "waste-009", riverId: "river-musi", zoneId: "zone-musi-07", category: "Plastic", weightKg: 140, confidence: 80, detectedAt: "2026-09-05T09:15:00Z", disposalRecommendation: "Recycling facility" },

  // Zone 01 - Organic
  { id: "waste-010", riverId: "river-musi", zoneId: "zone-musi-01", category: "Organic", weightKg: 120, confidence: 95, detectedAt: "2026-09-08T07:20:00Z", disposalRecommendation: "Composting facility" },
  { id: "waste-011", riverId: "river-musi", zoneId: "zone-musi-01", category: "Organic", weightKg: 95, confidence: 92, detectedAt: "2026-09-06T11:45:00Z", disposalRecommendation: "Composting facility" },
  { id: "waste-012", riverId: "river-musi", zoneId: "zone-musi-01", category: "Mixed", weightKg: 45, confidence: 75, detectedAt: "2026-09-04T14:30:00Z", disposalRecommendation: "Waste segregation facility" },

  // Zone 05 - Mixed
  { id: "waste-013", riverId: "river-musi", zoneId: "zone-musi-05", category: "Mixed", weightKg: 165, confidence: 82, detectedAt: "2026-09-08T13:10:00Z", disposalRecommendation: "Waste segregation facility" },
  { id: "waste-014", riverId: "river-musi", zoneId: "zone-musi-05", category: "Plastic", weightKg: 125, confidence: 88, detectedAt: "2026-09-07T09:25:00Z", disposalRecommendation: "Recycling facility" },
  { id: "waste-015", riverId: "river-musi", zoneId: "zone-musi-05", category: "Organic", weightKg: 88, confidence: 90, detectedAt: "2026-09-06T16:15:00Z", disposalRecommendation: "Composting facility" },

  // Zone 06 - Domestic
  { id: "waste-016", riverId: "river-musi", zoneId: "zone-musi-06", category: "Sewage", weightKg: 145, confidence: 86, detectedAt: "2026-09-08T10:40:00Z", disposalRecommendation: "Sewage treatment plant" },
  { id: "waste-017", riverId: "river-musi", zoneId: "zone-musi-06", category: "Organic", weightKg: 78, confidence: 88, detectedAt: "2026-09-06T14:55:00Z", disposalRecommendation: "Composting facility" },
  { id: "waste-018", riverId: "river-musi", zoneId: "zone-musi-06", category: "Mixed", weightKg: 62, confidence: 72, detectedAt: "2026-09-04T11:30:00Z", disposalRecommendation: "Waste segregation facility" },

  // Zone 08 - Sewage
  { id: "waste-019", riverId: "river-musi", zoneId: "zone-musi-08", category: "Sewage", weightKg: 175, confidence: 89, detectedAt: "2026-09-08T09:50:00Z", disposalRecommendation: "Sewage treatment plant" },
  { id: "waste-020", riverId: "river-musi", zoneId: "zone-musi-08", category: "Plastic", weightKg: 68, confidence: 82, detectedAt: "2026-09-06T13:20:00Z", disposalRecommendation: "Recycling facility" },
  { id: "waste-021", riverId: "river-musi", zoneId: "zone-musi-08", category: "Mixed", weightKg: 52, confidence: 75, detectedAt: "2026-09-04T15:40:00Z", disposalRecommendation: "Waste segregation facility" },

  // Zone 03 - Domestic
  { id: "waste-022", riverId: "river-musi", zoneId: "zone-musi-03", category: "Organic", weightKg: 92, confidence: 91, detectedAt: "2026-09-08T08:30:00Z", disposalRecommendation: "Composting facility" },
  { id: "waste-023", riverId: "river-musi", zoneId: "zone-musi-03", category: "Mixed", weightKg: 58, confidence: 78, detectedAt: "2026-09-06T12:10:00Z", disposalRecommendation: "Waste segregation facility" },
  { id: "waste-024", riverId: "river-musi", zoneId: "zone-musi-03", category: "Plastic", weightKg: 42, confidence: 85, detectedAt: "2026-09-04T10:25:00Z", disposalRecommendation: "Recycling facility" },

  // Zone 09 - Organic
  { id: "waste-025", riverId: "river-musi", zoneId: "zone-musi-09", category: "Organic", weightKg: 68, confidence: 93, detectedAt: "2026-09-08T07:45:00Z", disposalRecommendation: "Composting facility" },
  { id: "waste-026", riverId: "river-musi", zoneId: "zone-musi-09", category: "Mixed", weightKg: 35, confidence: 76, detectedAt: "2026-09-06T11:15:00Z", disposalRecommendation: "Waste segregation facility" },

  // Zone 02 - Organic
  { id: "waste-027", riverId: "river-musi", zoneId: "zone-musi-02", category: "Organic", weightKg: 82, confidence: 94, detectedAt: "2026-09-08T08:00:00Z", disposalRecommendation: "Composting facility" },
  { id: "waste-028", riverId: "river-musi", zoneId: "zone-musi-02", category: "Mixed", weightKg: 45, confidence: 74, detectedAt: "2026-09-06T14:30:00Z", disposalRecommendation: "Waste segregation facility" },

  // Zone 10 - Mixed
  { id: "waste-029", riverId: "river-musi", zoneId: "zone-musi-10", category: "Mixed", weightKg: 72, confidence: 80, detectedAt: "2026-09-08T10:20:00Z", disposalRecommendation: "Waste segregation facility" },
  { id: "waste-030", riverId: "river-musi", zoneId: "zone-musi-10", category: "Plastic", weightKg: 48, confidence: 86, detectedAt: "2026-09-06T13:45:00Z", disposalRecommendation: "Recycling facility" },

  // Zone 11 - Agricultural
  { id: "waste-031", riverId: "river-musi", zoneId: "zone-musi-11", category: "Organic", weightKg: 58, confidence: 88, detectedAt: "2026-09-08T09:10:00Z", disposalRecommendation: "Composting facility" },
  { id: "waste-032", riverId: "river-musi", zoneId: "zone-musi-11", category: "Mixed", weightKg: 32, confidence: 72, detectedAt: "2026-09-06T15:30:00Z", disposalRecommendation: "Waste segregation facility" },

  // Zone 12 - Mixed
  { id: "waste-033", riverId: "river-musi", zoneId: "zone-musi-12", category: "Mixed", weightKg: 42, confidence: 78, detectedAt: "2026-09-08T11:25:00Z", disposalRecommendation: "Waste segregation facility" },
  { id: "waste-034", riverId: "river-musi", zoneId: "zone-musi-12", category: "Organic", weightKg: 28, confidence: 90, detectedAt: "2026-09-06T16:50:00Z", disposalRecommendation: "Composting facility" },
];

export function getWasteByZone(zoneId: string): WasteRecord[] {
  return wasteRecords.filter((w) => w.zoneId === zoneId);
}

export function getWasteByCategory(category: string): WasteRecord[] {
  return wasteRecords.filter((w) => w.category === category);
}

export function getTotalWasteByRiver(riverId: string): number {
  return wasteRecords
    .filter((w) => w.riverId === riverId)
    .reduce((sum, w) => sum + w.weightKg, 0);
}
