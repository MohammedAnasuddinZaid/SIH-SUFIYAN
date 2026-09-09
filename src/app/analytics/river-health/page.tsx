"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Droplets,
  MapPin,
  TriangleAlert,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { rivers } from "@/lib/demo-data/rivers";
import {
  getHealthStatus,
  getRiverHealthScore,
  getWaterParameterSummary,
  getWaterQualityTrend,
  getZonesByRiverSelector,
} from "@/lib/selectors";
import type { WaterParameterSummary } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DemoBadge } from "@/components/shared/demo-badge";

const HEALTH_COLOR: Record<string, string> = {
  Critical: "#ef4444",
  Poor: "#f97316",
  Fair: "#eab308",
  Good: "#22c55e",
  Excellent: "#10b981",
};

export default function RiverHealthAnalyticsPage() {
  const [riverId, setRiverId] = useState("river-musi");

  const riverComparison = useMemo(
    () =>
      rivers
        .map((r) => ({
          name: r.name,
          displayName: r.displayName,
          score: getRiverHealthScore(r.id),
        }))
        .sort((a, b) => b.score - a.score),
    []
  );

  const selectedRiver = rivers.find((r) => r.id === riverId) ?? rivers[0];
  const zones = useMemo(() => getZonesByRiverSelector(riverId), [riverId]);
  const wqTrend = useMemo(() => getWaterQualityTrend(riverId, 30), [riverId]);
  const params = useMemo(() => getWaterParameterSummary(riverId), [riverId]);

  const zoneData = useMemo(() => {
    const maxWaste = zones.length
      ? Math.max(...zones.map((z) => z.pollutionLevel), 1)
      : 1;
    return zones
      .map((z) => ({ ...z, wasteShare: Math.round((z.pollutionLevel / maxWaste) * 100) }))
      .sort((a, b) => b.waterQualityScore - a.waterQualityScore);
  }, [zones]);

  const highRisk = zones.filter((z) => z.riskLevel === "High" || z.riskLevel === "Critical").length;

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
                River Health Analytics
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Water quality scores, parameter trends and zone-level health.
            </p>
          </div>
          <div className="inline-flex h-10 flex-wrap items-center gap-0.5 rounded-xl bg-slate-100 p-0.5">
            {rivers.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRiverId(r.id)}
                className={cn(
                  "h-full rounded-lg px-3 text-xs font-medium transition-colors",
                  riverId === r.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {r.name}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Health Score"
            value={getRiverHealthScore(riverId)}
            unit="/100"
            status={getHealthStatus(getRiverHealthScore(riverId))}
            icon={<Activity className="h-4 w-4" />}
            description={selectedRiver.displayName}
          />
          <MetricCard
            title="Monitoring Zones"
            value={zones.length}
            icon={<MapPin className="h-4 w-4" />}
            description="Zones under monitoring"
          />
          <MetricCard
            title="High / Critical Risk"
            value={highRisk}
            icon={<TriangleAlert className="h-4 w-4" />}
            status={highRisk > 0 ? "High" : "Low"}
            description="Zones requiring intervention"
          />
          <MetricCard
            title="Avg Water Quality"
            value={zones.length ? Math.round(zones.reduce((s, z) => s + z.waterQualityScore, 0) / zones.length) : 0}
            unit="/100"
            icon={<Droplets className="h-4 w-4" />}
            description="Zone WQI average"
          />
        </div>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">River Health Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riverComparison} layout="vertical" margin={{ top: 4, right: 24, left: 12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: "#334155" }} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value, _name, props) => {
                        const name = props?.payload?.displayName ?? "";
                        return [`${value} / 100`, name || "Health score"];
                      }}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                    />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                      {riverComparison.map((entry) => (
                        <Cell key={entry.name} fill={HEALTH_COLOR[getHealthStatus(entry.score)]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Water Quality Trend — {selectedRiver.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {wqTrend.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  Trend data is only available for the Musi River in this prototype.
                </p>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={wqTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="wqHealthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={28} />
                      <YAxis domain={[40, 90]} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={36} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                      <Area type="monotone" dataKey="value" name="WQI" stroke="#0d9488" strokeWidth={2} fill="url(#wqHealthGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Zone Health — {selectedRiver.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {zoneData.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No monitoring zones configured for this river.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone</TableHead>
                      <TableHead>WQI</TableHead>
                      <TableHead>Pollution</TableHead>
                      <TableHead>Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zoneData.map((z) => (
                      <TableRow key={z.id}>
                        <TableCell className="font-medium">{z.name}</TableCell>
                        <TableCell className="font-semibold tabular-nums">{z.waterQualityScore}/100</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${z.wasteShare}%`, backgroundColor: z.pollutionLevel > 60 ? "#f97316" : z.pollutionLevel > 40 ? "#eab308" : "#22c55e" }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">{z.pollutionLevel}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={z.riskLevel} variant="risk" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Water Parameters — {selectedRiver.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {params.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Parameter data is only available for the Musi River.
                  </p>
                ) : (
                  params.map((p: WaterParameterSummary) => (
                    <div key={p.parameter} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{p.parameter}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.value}
                          {p.unit} {p.unit && "·"} {p.status}
                        </p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))
                )}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Detailed parameter ranges are available in the River Health Dashboard.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}