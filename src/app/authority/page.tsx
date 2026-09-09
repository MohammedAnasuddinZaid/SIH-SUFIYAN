"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  ListChecks,
  ShieldCheck,
  TriangleAlert,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pollutionReports } from "@/lib/demo-data/reports";
import { actions } from "@/lib/demo-data/actions";
import { monitoringZones } from "@/lib/demo-data/monitoring-zones";
import type { PollutionReport, Priority, ReportStatus } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DemoBadge } from "@/components/shared/demo-badge";

const TEAMS = [
  "Sanitation Team A",
  "Sanitation Team B",
  "Sanitation Team C",
  "Rapid Response",
  "Water Quality Unit",
  "Quality Assurance",
];

const priorityRank: Record<Priority, number> = { Low: 0, Medium: 1, High: 2, Urgent: 3 };

function severityToPriority(severity: PollutionReport["severity"]): Priority {
  switch (severity) {
    case "Critical":
      return "Urgent";
    case "High":
      return "High";
    case "Moderate":
      return "Medium";
    case "Low":
      return "Low";
  }
}

export default function AuthorityPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const operational = useMemo(
    () =>
      pollutionReports.map((r) => ({
        ...r,
        priority: severityToPriority(r.severity),
      })),
    []
  );

  const priorityQueue = useMemo(
    () =>
      operational
        .filter((r) => r.status !== "resolved")
        .sort(
          (a, b) =>
            priorityRank[b.priority] - priorityRank[a.priority] ||
            a.submittedAt.localeCompare(b.submittedAt)
        )
        .slice(0, 6),
    [operational]
  );

  const counts = useMemo(() => {
    const byStatus = new Map<ReportStatus, number>();
    pollutionReports.forEach((r) =>
      byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1)
    );
    return {
      total: pollutionReports.length,
      active: pollutionReports.filter((r) => r.status !== "resolved").length,
      resolved: byStatus.get("resolved") ?? 0,
      critical: pollutionReports.filter((r) => r.severity === "Critical").length,
    };
  }, []);

  const teamLoad = useMemo(() => {
    const map = new Map<string, number>();
    actions.forEach((a) => {
      if (a.status === "completed" || a.status === "awaiting_verification") return;
      const name = a.assignedTeam;
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return TEAMS.map((team) => ({ team, open: map.get(team) ?? 0 }));
  }, []);

  const zonesHighCritical = monitoringZones.filter(
    (z) => z.riskLevel === "High" || z.riskLevel === "Critical"
  ).length;

  const filteredQueue =
    statusFilter === "all"
      ? priorityQueue
      : priorityQueue.filter((r) => r.status === statusFilter);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                Authority Command Center
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Operational overview for river authorities — triage reports, assign
              teams and track cleanups to resolution.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="outline" render={<Link href="/action-center" />} className="gap-2">
              <Wrench className="h-4 w-4" />
              Open Action Center
            </Button>
            <Button render={<Link href="/report-pollution" />} className="gap-2">
              <Flag className="h-4 w-4" />
              New Report
            </Button>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Open Reports" value={counts.active} icon={<FileText className="h-4 w-4" />} description={`${counts.total} total in system`} />
          <MetricCard title="Critical Severity" value={counts.critical} icon={<TriangleAlert className="h-4 w-4" />} description="Require immediate triage" />
          <MetricCard title="Resolved" value={counts.resolved} icon={<CheckCircle2 className="h-4 w-4" />} description="Verified closures" />
          <MetricCard title="High-Risk Zones" value={zonesHighCritical} icon={<ShieldCheck className="h-4 w-4" />} description={`${monitoringZones.length} total zones`} />
        </div>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-sm">Priority Queue</CardTitle>
                <div className="inline-flex h-8 items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
                  {["all", "submitted", "triaged", "assigned", "in_progress"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "h-full rounded-md px-2.5 text-xs font-medium capitalize transition-colors",
                        statusFilter === s
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {s === "all" ? "All" : s.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {filteredQueue.length === 0 ? (
                <EmptyState
                  icon={<Clock3 className="h-5 w-5" />}
                  title="Queue is clear"
                  description="No open reports match this filter."
                />
              ) : (
                <div className="space-y-2.5">
                  {filteredQueue.map((r) => (
                    <div
                      key={r.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-xl border p-3.5 sm:flex-row sm:items-center",
                        r.severity === "Critical"
                          ? "border-red-200 bg-red-50/60"
                          : r.severity === "High"
                            ? "border-orange-200 bg-orange-50/50"
                            : "border-slate-200 bg-white"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/reports/${r.reportNumber}`}
                            className="font-mono text-xs font-semibold text-[#0c1e3a] hover:underline"
                          >
                            {r.reportNumber}
                          </Link>
                          <StatusBadge status={r.severity} variant="severity" />
                          <StatusBadge status={r.priority} variant="priority" />
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-700">{r.location}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {r.pollutionType} · {r.reporterName} ·{" "}
                          {new Date(r.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={r.status} />
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={`/reports/${r.reportNumber}`} />}
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Link
                  href="/authority/reports"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Manage all reports
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Team Workload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamLoad
                    .filter((t) => t.open > 0 || selectedTeam === null)
                    .map((t) => (
                      <button
                        key={t.team}
                        type="button"
                        onClick={() => setSelectedTeam(t.open > 0 ? t.team : null)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors",
                          selectedTeam === t.team
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-transparent hover:bg-slate-50"
                        )}
                      >
                        <span className="text-sm font-medium">{t.team}</span>
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold",
                              t.open > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"
                            )}
                          >
                            {t.open}
                          </span>
                        </span>
                      </button>
                    ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Open actions per field team (demo). Click a team to highlight it.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ListChecks className="h-4 w-4" />
                  Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  render={<Link href="/authority/reports" />}
                >
                  <FileText className="h-4 w-4" />
                  Reports & Triage
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  render={<Link href="/authority/actions" />}
                >
                  <ListChecks className="h-4 w-4" />
                  Actions & Teams
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  render={<Link href="/action-center" />}
                >
                  <Wrench className="h-4 w-4" />
                  Action Center
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  render={<Link href="/analytics/operations" />}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Operations Analytics
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}