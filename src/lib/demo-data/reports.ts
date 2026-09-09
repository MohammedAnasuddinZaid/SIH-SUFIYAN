import { PollutionReport } from "../types";

export const pollutionReports: PollutionReport[] = [
  // Submitted (3)
  { id: "rpt-001", reportNumber: "JS-2026-00401", riverId: "river-musi", location: "Zone 04 - Mozamjahi Market", latitude: 17.426, longitude: 78.413, pollutionType: "Plastic", description: "Large accumulation of plastic waste near bridge", severity: "Critical", status: "submitted", submittedAt: "2026-09-09T06:15:00Z", reporterName: "Priya Sharma" },
  { id: "rpt-002", reportNumber: "JS-2026-00402", riverId: "river-musi", location: "Zone 03 - Mehdipatnam", latitude: 17.413, longitude: 78.389, pollutionType: "Domestic Sewage", description: "Raw sewage discharge from residential area", severity: "Moderate", status: "submitted", submittedAt: "2026-09-09T07:30:00Z", reporterName: "Rajesh Kumar" },
  { id: "rpt-003", reportNumber: "JS-2026-00403", riverId: "river-musi", location: "Zone 01 - Osman Sagar", latitude: 17.386, longitude: 78.343, pollutionType: "Organic", description: "Minor organic waste near bank", severity: "Low", status: "submitted", submittedAt: "2026-09-09T08:45:00Z", reporterName: "Anjali Reddy" },

  // Triaged (4)
  { id: "rpt-004", reportNumber: "JS-2026-00404", riverId: "river-musi", location: "Zone 07 - Dabirpur", latitude: 17.466, longitude: 78.483, pollutionType: "Industrial", description: "Chemical discharge from nearby factory", severity: "High", status: "triaged", submittedAt: "2026-09-08T14:20:00Z", reporterName: "Venkat Rao", assignedTo: "Industrial Pollution Unit" },
  { id: "rpt-005", reportNumber: "JS-2026-00405", riverId: "river-musi", location: "Zone 04 - Mozamjahi Market", latitude: 17.424, longitude: 78.411, pollutionType: "Plastic", description: "AI detected 2.1x plastic above baseline", severity: "High", status: "triaged", submittedAt: "2026-09-08T10:10:00Z", reporterName: "AI System", assignedTo: "Sanitation Team A" },
  { id: "rpt-006", reportNumber: "JS-2026-00406", riverId: "river-musi", location: "Zone 05 - Abids", latitude: 17.439, longitude: 78.436, pollutionType: "Mixed", description: "Mixed waste accumulation near market area", severity: "Moderate", status: "triaged", submittedAt: "2026-09-08T09:45:00Z", reporterName: "Suresh Babu", assignedTo: "Sanitation Team B" },
  { id: "rpt-007", reportNumber: "JS-2026-00407", riverId: "river-musi", location: "Zone 08 - Nala.Nullah", latitude: 17.479, longitude: 78.506, pollutionType: "Domestic Sewage", description: "Overflowing sewage drain into river", severity: "High", status: "triaged", submittedAt: "2026-09-08T08:30:00Z", reporterName: "Deepak Singh", assignedTo: "Water Quality Unit" },

  // Assigned (5)
  { id: "rpt-008", reportNumber: "JS-2026-00408", riverId: "river-musi", location: "Zone 04 - Mozamjahi Market", latitude: 17.427, longitude: 78.414, pollutionType: "Plastic", description: "Persistent plastic dumping near bridge", severity: "Critical", status: "assigned", submittedAt: "2026-09-07T16:00:00Z", reporterName: "Meera Patel", assignedTo: "Sanitation Team A" },
  { id: "rpt-009", reportNumber: "JS-2026-00409", riverId: "river-musi", location: "Zone 07 - Dabirpur", latitude: 17.464, longitude: 78.481, pollutionType: "Industrial", description: "Factory effluent discharge", severity: "High", status: "assigned", submittedAt: "2026-09-07T12:15:00Z", reporterName: "Kiran Kumar", assignedTo: "Rapid Response" },
  { id: "rpt-010", reportNumber: "JS-2026-00410", riverId: "river-musi", location: "Zone 06 - Koti", latitude: 17.453, longitude: 78.459, pollutionType: "Domestic Sewage", description: "Sewage pipe leak near school", severity: "High", status: "assigned", submittedAt: "2026-09-07T10:30:00Z", reporterName: "Lakshmi Devi", assignedTo: "Water Quality Unit" },
  { id: "rpt-011", reportNumber: "JS-2026-00411", riverId: "river-musi", location: "Zone 09 - Nagole", latitude: 17.493, longitude: 78.529, pollutionType: "Organic", description: "Water quality drop detected by sensors", severity: "Moderate", status: "assigned", submittedAt: "2026-09-07T09:00:00Z", reporterName: "AI System", assignedTo: "Sanitation Team C" },
  { id: "rpt-012", reportNumber: "JS-2026-00412", riverId: "river-musi", location: "Zone 02 - Himayat Sagar", latitude: 17.399, longitude: 78.366, pollutionType: "Organic", description: "Minor organic waste from nearby farms", severity: "Low", status: "assigned", submittedAt: "2026-09-07T07:45:00Z", reporterName: "Ravi Teja", assignedTo: "Sanitation Team B" },

  // In Progress (4)
  { id: "rpt-013", reportNumber: "JS-2026-00413", riverId: "river-musi", location: "Zone 04 - Mozamjahi Market", latitude: 17.425, longitude: 78.412, pollutionType: "Plastic", description: "Ongoing cleanup of plastic accumulation", severity: "Critical", status: "in_progress", submittedAt: "2026-09-06T15:30:00Z", reporterName: "Sanjay Gupta", assignedTo: "Sanitation Team A" },
  { id: "rpt-014", reportNumber: "JS-2026-00414", riverId: "river-musi", location: "Zone 07 - Dabirpur", latitude: 17.467, longitude: 78.484, pollutionType: "Industrial", description: "Industrial waste containment in progress", severity: "High", status: "in_progress", submittedAt: "2026-09-06T11:00:00Z", reporterName: "Industrial Pollution Unit", assignedTo: "Rapid Response" },
  { id: "rpt-015", reportNumber: "JS-2026-00415", riverId: "river-musi", location: "Zone 05 - Abids", latitude: 17.437, longitude: 78.434, pollutionType: "Mixed", description: "Waste removal from market area underway", severity: "Moderate", status: "in_progress", submittedAt: "2026-09-06T08:20:00Z", reporterName: "Arun Mehta", assignedTo: "Sanitation Team B" },
  { id: "rpt-016", reportNumber: "JS-2026-00416", riverId: "river-musi", location: "Zone 08 - Nala.Nullah", latitude: 17.477, longitude: 78.504, pollutionType: "Domestic Sewage", description: "Sewage pipe repair in progress", severity: "Moderate", status: "in_progress", submittedAt: "2026-09-06T07:00:00Z", reporterName: "Municipal Corporation", assignedTo: "Water Quality Unit" },

  // Awaiting Verification (5)
  { id: "rpt-017", reportNumber: "JS-2026-00417", riverId: "river-musi", location: "Zone 04 - Mozamjahi Market", latitude: 17.428, longitude: 78.415, pollutionType: "Plastic", description: "Cleanup completed, awaiting verification", severity: "High", status: "awaiting_verification", submittedAt: "2026-09-05T14:15:00Z", reporterName: "Sanitation Team A", assignedTo: "Quality Assurance" },
  { id: "rpt-018", reportNumber: "JS-2026-00418", riverId: "river-musi", location: "Zone 07 - Dabirpur", latitude: 17.465, longitude: 78.482, pollutionType: "Industrial", description: "Industrial discharge contained, pending tests", severity: "High", status: "awaiting_verification", submittedAt: "2026-09-05T11:30:00Z", reporterName: "Industrial Pollution Unit", assignedTo: "Quality Assurance" },
  { id: "rpt-019", reportNumber: "JS-2026-00419", riverId: "river-musi", location: "Zone 03 - Mehdipatnam", latitude: 17.414, longitude: 78.390, pollutionType: "Domestic Sewage", description: "Sewage treatment plant check completed", severity: "Moderate", status: "awaiting_verification", submittedAt: "2026-09-05T09:00:00Z", reporterName: "Water Quality Unit", assignedTo: "Quality Assurance" },
  { id: "rpt-020", reportNumber: "JS-2026-00420", riverId: "river-musi", location: "Zone 06 - Koti", latitude: 17.451, longitude: 78.457, pollutionType: "Domestic Sewage", description: "Pipe repair completed, water test pending", severity: "Moderate", status: "awaiting_verification", submittedAt: "2026-09-05T07:45:00Z", reporterName: "Sanitation Team C", assignedTo: "Quality Assurance" },
  { id: "rpt-021", reportNumber: "JS-2026-00421", riverId: "river-musi", location: "Zone 01 - Osman Sagar", latitude: 17.387, longitude: 78.344, pollutionType: "Organic", description: "Organic waste cleanup done, monitoring", severity: "Low", status: "awaiting_verification", submittedAt: "2026-09-05T06:30:00Z", reporterName: "Sanitation Team B", assignedTo: "Quality Assurance" },

  // Resolved (4)
  { id: "rpt-022", reportNumber: "JS-2026-00422", riverId: "river-musi", location: "Zone 04 - Mozamjahi Market", latitude: 17.423, longitude: 78.410, pollutionType: "Plastic", description: "Plastic waste removed and area cleaned", severity: "High", status: "resolved", submittedAt: "2026-09-04T16:45:00Z", reporterName: "Sanitation Team A" },
  { id: "rpt-023", reportNumber: "JS-2026-00423", riverId: "river-musi", location: "Zone 07 - Dabirpur", latitude: 17.463, longitude: 78.480, pollutionType: "Industrial", description: "Industrial source identified and controlled", severity: "High", status: "resolved", submittedAt: "2026-09-04T12:00:00Z", reporterName: "Rapid Response" },
  { id: "rpt-024", reportNumber: "JS-2026-00424", riverId: "river-musi", location: "Zone 05 - Abids", latitude: 17.436, longitude: 78.433, pollutionType: "Mixed", description: "Market waste properly disposed", severity: "Moderate", status: "resolved", submittedAt: "2026-09-04T09:30:00Z", reporterName: "Sanitation Team B" },
  { id: "rpt-025", reportNumber: "JS-2026-00425", riverId: "river-musi", location: "Zone 02 - Himayat Sagar", latitude: 17.397, longitude: 78.364, pollutionType: "Organic", description: "Farm waste properly composted", severity: "Low", status: "resolved", submittedAt: "2026-09-04T07:15:00Z", reporterName: "Sanitation Team C" },
];

export function getReportsByZone(zoneId: string): PollutionReport[] {
  return pollutionReports.filter((r) => r.location.includes(zoneId));
}

export function getReportsByStatus(status: string): PollutionReport[] {
  return pollutionReports.filter((r) => r.status === status);
}

export function getReportsBySeverity(severity: string): PollutionReport[] {
  return pollutionReports.filter((r) => r.severity === severity);
}
