import { Action } from "../types";

export const actions: Action[] = [
  // Planned (3)
  { id: "act-001", title: "Zone 11 Agricultural Runoff Assessment", description: "Assess and monitor agricultural runoff patterns in Zone 11", priority: "Medium", status: "planned", dueDate: "2026-09-15", assignedTeam: "Sanitation Team C", zoneId: "zone-musi-11" },
  { id: "act-002", title: "Zone 12 Water Quality Baseline", description: "Establish water quality baseline for confluence area", priority: "Low", status: "planned", dueDate: "2026-09-18", assignedTeam: "Water Quality Unit", zoneId: "zone-musi-12" },
  { id: "act-003", title: "Zone 09 Community Outreach", description: "Organize community awareness program in Nagole area", priority: "Medium", status: "planned", dueDate: "2026-09-20", assignedTeam: "Sanitation Team B", zoneId: "zone-musi-09" },

  // Assigned (3)
  { id: "act-004", title: "Zone 04 Plastic Waste Cleanup", description: "Major plastic waste cleanup operation at Mozamjahi Market", priority: "Urgent", status: "assigned", dueDate: "2026-09-10", assignedTeam: "Sanitation Team A", relatedReportId: "rpt-008", zoneId: "zone-musi-04" },
  { id: "act-005", title: "Zone 07 Industrial Source Investigation", description: "Investigate and identify industrial discharge sources", priority: "High", status: "assigned", dueDate: "2026-09-11", assignedTeam: "Rapid Response", relatedReportId: "rpt-009", zoneId: "zone-musi-07" },
  { id: "act-006", title: "Zone 08 Sewage Pipe Repair", description: "Complete repair of overflowing sewage pipe", priority: "High", status: "assigned", dueDate: "2026-09-12", assignedTeam: "Water Quality Unit", relatedReportId: "rpt-010", zoneId: "zone-musi-08" },

  // In Progress (4)
  { id: "act-007", title: "Zone 04 Emergency Cleanup", description: "Ongoing emergency cleanup of plastic and sewage accumulation", priority: "Urgent", status: "in_progress", dueDate: "2026-09-09", assignedTeam: "Sanitation Team A", relatedReportId: "rpt-013", zoneId: "zone-musi-04" },
  { id: "act-008", title: "Zone 07 Waste Containment", description: "Contain industrial waste and prevent further discharge", priority: "High", status: "in_progress", dueDate: "2026-09-10", assignedTeam: "Rapid Response", relatedReportId: "rpt-014", zoneId: "zone-musi-07" },
  { id: "act-009", title: "Zone 05 Market Waste Removal", description: "Remove accumulated waste from market area", priority: "Medium", status: "in_progress", dueDate: "2026-09-11", assignedTeam: "Sanitation Team B", relatedReportId: "rpt-015", zoneId: "zone-musi-05" },
  { id: "act-010", title: "Zone 06 Sewage System Maintenance", description: "Repair and maintain sewage system infrastructure", priority: "Medium", status: "in_progress", dueDate: "2026-09-12", assignedTeam: "Water Quality Unit", relatedReportId: "rpt-016", zoneId: "zone-musi-06" },

  // Completed (3)
  { id: "act-011", title: "Zone 04 Initial Response", description: "Initial assessment and containment of pollution", priority: "High", status: "completed", dueDate: "2026-09-08", assignedTeam: "Sanitation Team A", relatedReportId: "rpt-022", zoneId: "zone-musi-04" },
  { id: "act-012", title: "Zone 07 Source Identification", description: "Identify industrial pollution source", priority: "High", status: "completed", dueDate: "2026-09-08", assignedTeam: "Rapid Response", relatedReportId: "rpt-023", zoneId: "zone-musi-07" },
  { id: "act-013", title: "Zone 05 Waste Disposal", description: "Proper disposal of accumulated market waste", priority: "Medium", status: "completed", dueDate: "2026-09-08", assignedTeam: "Sanitation Team B", relatedReportId: "rpt-024", zoneId: "zone-musi-05" },

  // Awaiting Verification (2)
  { id: "act-014", title: "Zone 01 Organic Waste Composting", description: "Verify composting of organic waste at Osman Sagar", priority: "Low", status: "awaiting_verification", dueDate: "2026-09-09", assignedTeam: "Sanitation Team C", relatedReportId: "rpt-021", zoneId: "zone-musi-01" },
  { id: "act-015", title: "Zone 02 Farm Waste Management", description: "Verify proper composting of farm waste", priority: "Low", status: "awaiting_verification", dueDate: "2026-09-09", assignedTeam: "Sanitation Team C", relatedReportId: "rpt-025", zoneId: "zone-musi-02" },
];

export function getActionsByZone(zoneId: string): Action[] {
  return actions.filter((a) => a.zoneId === zoneId);
}

export function getActionsByStatus(status: string): Action[] {
  return actions.filter((a) => a.status === status);
}

export function getActionsByTeam(team: string): Action[] {
  return actions.filter((a) => a.assignedTeam === team);
}
