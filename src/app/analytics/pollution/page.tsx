"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Factory,
  Radar,
  TriangleAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { pollutionSources, anomalies } from "@/lib/demo-data/analytics";
import { getPollutionTrend } from "@/lib/selectors";
import { getZoneById } from "@/lib/demo-data/monitoring-zones";
import { StatusBadge } from "@/components/shared/status-badge";
import { DemoBadge } from "@/components/shared/demo-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";

const RISK_BAR: Record<string, string> = {
  Low: "#22c55e",
  Medium: "#eab308",
  High: "#f97316",
  Critical: "#ef4444",
};

function formatAnomalyTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PollutionAnalyticsPage() {
  const [sourceFilter, setSourceFilter] = useState("all");

  const sources = useMemo(() => pollutionSources, []);
  const filteredSources = useMemo(
    () => (sourceFilter === "all" ? sources : sources.filter((s) => s.risk === sourceFilter)),
    [sources, sourceFilter]
  );

  const allTrend = useMemo(() => getPollutionTrend("river-musi", 30), []);
  const aggregateTrend = useMemo(
    () =>
      allTrend.map((d) => ({
        date: d.date.slice(5),
        total: d.plastic + d.sewage + d.industrial + d.organic,
      })),
    [allTrend]
  );

  const riskCounts = useMemo(() => {
    return {
      High: sources.filter((s) => s.risk === "High").length,
      Medium: sources.filter((s) => s.risk === "Medium").length,
      Low: sources.filter((s) => s.risk === "Low").length,
    };
  }, [sources]);

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
                Pollution Analytics
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Source ranking, incident trends and AI-detected anomalies.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Pollution Sources" value={sources.length} icon={<Factory className="h-4 w-4" />} description="Ranked contributors" />
          <MetricCard title="High-Risk Sources" value={riskCounts.High} icon={<TriangleAlert className="h-4 w-4" />} description="Require intervention" />
          <MetricCard title="Active Anomalies" value={anomalies.length} icon={<Radar className="h-4 w-4" />} description="AI-detected deviations" />
          <MetricCard title="Rising Trend" value={sources.filter((s) => s.trend === "up").length} icon={<TrendingUp className="h-4 w-4" />} description="Sources trending up" />
        </div>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detected Pollution Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex gap-2">
                {["all", "High", "Medium", "Low"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSourceFilter(f)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      sourceFilter === f
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {f === "all" ? "All" : f}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {filteredSources.map((s) => (
                  <div key={s.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.source}</span>
                      <span className="text-xs text-muted-foreground">
                        {s.incidentCount} incidents · conf. {s.confidence}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${s.confidence}%`, backgroundColor: RISK_BAR[s.risk] }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={s.risk} variant="risk" />
                        <span>{s.evidence}</span>
                      </div>
                      {s.trend === "up" ? (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <TrendingUp className="h-3.5 w-3.5" /> rising
                        </span>
                      ) : s.trend === "down" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <TrendingDown className="h-3.5 w-3.5" /> falling
                        </span>
                      ) : (
                        <span className="text-slate-400">stable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Waste Accumulation Trend — Musi</CardTitle>
            </CardHeader>
            <CardContent>
              {aggregateTrend.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  No trend data available.
                </p>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregateTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={24} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={40} />
                      <Tooltip
                        formatter={(value) => [`${Number(value ?? 0).toLocaleString()} kg`, "Detected waste"]}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Bar dataKey="total" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Prototype trend derived from deterministic demo waste records.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Radar className="h-4 w-4" />
                AI-Detected Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Observed</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Deviation</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Detected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalies.map((a) => {
                    const zone = getZoneById(a.entityId);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.metric}</TableCell>
                        <TableCell className="text-xs text-slate-600">{zone?.name ?? a.entityId}</TableCell>
                        <TableCell className="tabular-nums">{a.observedValue}</TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">{a.expectedValue}</TableCell>
                        <TableCell className="font-semibold tabular-nums">
                          {a.deviation.toFixed(2)}×
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={a.severity} variant="severity" />
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{formatAnomalyTime(a.detectedAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <p className="mt-3 text-xs text-muted-foreground">
                Anomalies are computed against baseline expectations from the demo
                dataset and are illustrative only.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}