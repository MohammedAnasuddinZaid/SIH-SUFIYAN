"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import { pollutionReports } from "@/lib/demo-data/reports";
import type { Priority, ReportStatus, Severity } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportOperationsTable, type OperationalReport } from "@/components/authority/report-operations-table";
import { DemoBadge } from "@/components/shared/demo-badge";

function derivePriority(severity: Severity): Priority {
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

export default function AuthorityReportsPage() {
  const [reports, setReports] = useState<OperationalReport[]>(() =>
    pollutionReports.map((r) => ({ ...r, priority: derivePriority(r.severity) }))
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const counts = useMemo(() => {
    const byStatus = new Map<ReportStatus, number>();
    reports.forEach((r) => byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1));
    return {
      total: reports.length,
      open: reports.filter((r) => r.status !== "resolved").length,
      critical: reports.filter((r) => r.severity === "Critical").length,
      submitted: byStatus.get("submitted") ?? 0,
    };
  }, [reports]);

  function handleTriage(
    id: string,
    patch: { severity: Severity; status: ReportStatus; priority: Priority }
  ) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  function handleAssign(id: string, team: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, assignedTo: team, status: "assigned" as ReportStatus } : r
      )
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Button variant="ghost" size="sm" render={<Link href="/authority" />} className="mb-3 gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Command Center
        </Button>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                Report Operations
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Triage severity, priority and status, and assign teams for every
              pollution report.
            </p>
          </div>
          <Card size="sm" className="shrink-0">
            <CardContent className="pt-2">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>
                  <span className="text-lg font-bold text-[#0c1e3a]">{counts.total}</span> total
                </span>
                <span>
                  <span className="text-lg font-bold text-blue-700">{counts.open}</span> open
                </span>
                <span>
                  <span className="text-lg font-bold text-red-700">{counts.critical}</span> critical
                </span>
                <span>
                  <span className="text-lg font-bold text-indigo-700">{counts.submitted}</span>
                  <span className="hidden sm:inline"> untriaged</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </header>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                Search, Filter & Triage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReportOperationsTable
                reports={reports}
                statusFilter={statusFilter}
                severityFilter={severityFilter}
                onStatusFilterChange={setStatusFilter}
                onSeverityFilterChange={setSeverityFilter}
                onTriage={handleTriage}
                onAssign={handleAssign}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}