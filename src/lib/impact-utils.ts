import { wasteRecords } from "./demo-data/waste";
import { actions } from "./demo-data/actions";
import { pollutionReports } from "./demo-data/reports";

export function calculateWasteMetrics() {
  const detected = wasteRecords.reduce((sum, r) => sum + r.weightKg, 0);
  const completedOrVerified = actions.filter(
    (a) => a.status === "completed" || a.status === "awaiting_verification"
  );
  const collected = Math.round(detected * 0.72);
  const inTransit = actions.filter((a) => a.status === "in_progress").length;
  const treated = Math.round(collected * 0.85);
  const verified = actions.filter((a) => a.status === "awaiting_verification").length;
  const variance = collected - treated;
  const variancePercent = Math.round((variance / detected) * 10000) / 100;

  return {
    detected,
    collected,
    transported: Math.round(collected * 0.92),
    treated,
    verified,
    inTransit,
    completedOrVerifiedCount: completedOrVerified.length,
    variance,
    variancePercent,
    totalRecords: wasteRecords.length,
  };
}

export function getImpactFunnel() {
  const received = pollutionReports.length;
  const triaged = pollutionReports.filter(
    (r) =>
      r.status === "triaged" ||
      r.status === "assigned" ||
      r.status === "in_progress" ||
      r.status === "awaiting_verification" ||
      r.status === "resolved"
  ).length;
  const actioned = pollutionReports.filter((r) =>
    actions.some((a) => a.relatedReportId === r.id)
  ).length;
  const completed = actions.filter((a) => a.status === "completed").length;
  const verified = actions.filter(
    (a) => a.status === "awaiting_verification"
  ).length;
  const resolved = pollutionReports.filter((r) => r.status === "resolved").length;

  return [
    { stage: "Reports Received", count: received, label: `${received} reports` },
    { stage: "Triaged", count: triaged, label: `${triaged} triaged` },
    { stage: "Actions Created", count: actioned, label: `${actioned} actions` },
    { stage: "Actions Completed", count: completed, label: `${completed} completed` },
    { stage: "Verified", count: verified, label: `${verified} in review` },
    { stage: "Resolved", count: resolved, label: `${resolved} resolved` },
  ];
}

export function getMonthlyWasteRemoved() {
  return [
    { month: "Apr 2026", value: 380 },
    { month: "May 2026", value: 420 },
    { month: "Jun 2026", value: 510 },
    { month: "Jul 2026", value: 460 },
    { month: "Aug 2026", value: 590 },
    { month: "Sep 2026", value: 480 },
  ];
}
