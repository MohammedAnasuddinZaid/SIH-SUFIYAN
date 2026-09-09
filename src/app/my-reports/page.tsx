"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Flag,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pollutionReports } from "@/lib/demo-data/reports";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DemoBadge } from "@/components/shared/demo-badge";

const STATUS_FLOW = ["submitted", "triaged", "assigned", "in_progress", "awaiting_verification", "resolved"];

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  triaged: "Triaged",
  assigned: "Assigned",
  in_progress: "In Progress",
  awaiting_verification: "Awaiting Verification",
  resolved: "Resolved",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

export default function MyReportsPage() {
  const reports = useMemo(() => pollutionReports, []);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(
    () => ({
      total: reports.length,
      open: reports.filter((r) => r.status !== "resolved").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
      submittedByCitizens: reports.filter((r) => r.reporterName !== "AI System").length,
    }),
    [reports]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reports
      .filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (
          term &&
          !`${r.reportNumber} ${r.pollutionType} ${r.location} ${r.reporterName}`.toLowerCase().includes(term)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [reports, statusFilter, search]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                My Reports
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Track the lifecycle of submitted pollution reports — from submission
              to verification.
            </p>
          </div>
          <Button render={<Link href="/reports/new" />} className="gap-1.5">
            Report Pollution
            <Flag className="h-4 w-4" />
          </Button>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Reports" value={counts.total} icon={<FileText className="h-4 w-4" />} description="Citizen + AI generated" />
          <MetricCard title="Open" value={counts.open} icon={<MapPin className="h-4 w-4" />} description="In the resolution pipeline" />
          <MetricCard title="Resolved" value={counts.resolved} icon={<Flag className="h-4 w-4" />} description="Verified & closed" />
          <MetricCard title="By Citizens" value={counts.submittedByCitizens} icon={<Users className="h-4 w-4" />} description="Signed citizen reports" />
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Report History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by number, type, location or reporter…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="inline-flex h-9 flex-wrap items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
                  {["all", ...STATUS_FLOW].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "h-full rounded-md px-3 text-xs font-medium transition-colors",
                        statusFilter === s
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {s === "all" ? "All" : STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={<FileText className="h-5 w-5" />}
                  title="No reports found"
                  description="Try changing the status filter or clearing the search."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800">{r.reportNumber}</span>
                              <span className="text-xs text-slate-400">{r.reporterName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{r.pollutionType}</TableCell>
                          <TableCell className="text-xs text-slate-600">{r.location}</TableCell>
                          <TableCell>
                            <StatusBadge status={r.severity} variant="severity" />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={r.status} variant="status" />
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">{formatDate(r.submittedAt)}</TableCell>
                          <TableCell className="text-xs text-slate-600">{r.assignedTo ?? "—"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="xs"
                              render={<Link href={`/reports/${r.reportNumber}`} />}
                              className="gap-1"
                            >
                              View
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}