"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { pollutionReports } from "@/lib/demo-data/reports";
import { actions } from "@/lib/demo-data/actions";
import { impactMetrics } from "@/lib/demo-data/impact";
import { getImpactFunnel } from "@/lib/impact-utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DemoBadge } from "@/components/shared/demo-badge";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#3b82f6",
  triaged: "#6366f1",
  assigned: "#a855f7",
  in_progress: "#f59e0b",
  awaiting_verification: "#14b8a6",
  resolved: "#22c55e",
};

export default function OperationsAnalyticsPage() {
  const reportStatusDist = useMemo(() => {
    const map = new Map<string, number>();
    pollutionReports.forEach((r) => map.set(r.status, (map.get(r.status) ?? 0) + 1));
    return [...map.entries()].map(([status, count]) => ({ status, count }));
  }, []);

  const actionByTeam = useMemo(() => {
    const map = new Map<string, { open: number; done: number }>();
    actions.forEach((a) => {
      const entry = map.get(a.assignedTeam) ?? { open: 0, done: 0 };
      if (a.status === "completed" || a.status === "awaiting_verification") entry.done += 1;
      else entry.open += 1;
      map.set(a.assignedTeam, entry);
    });
    return [...map.entries()]
      .map(([team, v]) => ({ team, ...v }))
      .sort((a, b) => b.open + b.done - (a.open + a.done));
  }, []);

  const funnel = useMemo(() => getImpactFunnel(), []);
  const totalReports = pollutionReports.length;
  const openReports = pollutionReports.filter((r) => r.status !== "resolved").length;
  const resolved = pollutionReports.filter((r) => r.status === "resolved").length;
  const openActions = actions.filter((a) => a.status !== "completed" && a.status !== "awaiting_verification").length;
  const completionPct = actions.length ? Math.round((actions.filter((a) => a.status === "completed").length / actions.length) * 100) : 0;
  const sla = impactMetrics.find((m) => m.metric === "SLA Compliance");

  const resolutionPct = totalReports ? Math.round((resolved / totalReports) * 100) : 0;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Button variant="ghost" size="sm" render={<Link href="/analytics" />} className="mb-3 gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Analytics
        </Button>
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                Operations Analytics
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Report lifecycle, team workload and resolution performance.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Open Reports" value={openReports} icon={<FileText className="h-4 w-4" />} description={`${totalReports} total in system`} />
          <MetricCard title="Resolution Rate" value={`${resolutionPct}%`} icon={<CheckCircle2 className="h-4 w-4" />} description={`${resolved} resolved reports`} />
          <MetricCard title="Open Actions" value={openActions} icon={<Clock3 className="h-4 w-4" />} description={`${completionPct}% completion`} />
          <MetricCard
            title="SLA Compliance"
            value={typeof sla?.value === "number" ? `${sla.value}%` : "—"}
            unit={undefined}
            icon={<BadgeCheck className="h-4 w-4" />}
            status={typeof sla?.value === "number" && sla.value >= 80 ? "Good" : "Moderate"}
            description="Prototype target: ≥ 80%"
          />
        </div>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reports by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportStatusDist} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#334155" }} tickLine={false} axisLine={false} interval={0} angle={-14} height={60} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {reportStatusDist.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#64748b"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Team Workload — Open vs Completed Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {actionByTeam.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">No action data.</p>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={actionByTeam} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="24%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="team" tick={{ fontSize: 11, fill: "#334155" }} tickLine={false} axisLine={false} interval={0} angle={-14} height={60} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                      <Bar dataKey="open" name="Open" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="done" name="Completed" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Resolution Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {funnel.map((f, i) => {
                  const ratio = funnel[0].count ? Math.round((f.count / funnel[0].count) * 100) : 0;
                  const prevRatio = i > 0 && funnel[i - 1].count ? Math.round((f.count / funnel[i - 1].count) * 100) : null;
                  return (
                    <div key={f.stage} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 text-sm font-medium">{f.stage}</span>
                      <div className="h-7 flex-1 overflow-hidden rounded-md bg-slate-100">
                        <div
                          className="flex h-full items-center justify-end rounded-md bg-gradient-to-r from-blue-600 to-blue-500 px-2"
                          style={{ width: `${Math.max(10, ratio)}%` }}
                        >
                          <span className="text-xs font-semibold text-white">{f.count}</span>
                        </div>
                      </div>
                      {prevRatio !== null && (
                        <span className="w-16 shrink-0 text-xs text-slate-500">{prevRatio}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Percentage column shows conversion relative to the previous stage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Team Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actionByTeam.map((t) => (
                  <Link
                    key={t.team}
                    href="/authority/actions"
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                  >
                    <span className="font-medium">{t.team}</span>
                    <span className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <Clock3 className="h-3.5 w-3.5" /> {t.open}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t.done}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <StatusBadge status="High" variant="risk" />
                Risk zones requiring priority attention
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}