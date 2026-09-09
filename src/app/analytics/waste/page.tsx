"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Layers,
  Recycle,
  ScanLine,
  Truck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { wasteRecords } from "@/lib/demo-data/waste";
import { calculateWasteMetrics } from "@/lib/impact-utils";
import { rivers } from "@/lib/demo-data/rivers";
import type { WasteCategory } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/shared/metric-card";
import { DemoBadge } from "@/components/shared/demo-badge";

const CATEGORY_COLORS: Record<string, string> = {
  Plastic: "#0d9488",
  Sewage: "#f59e0b",
  Industrial: "#6366f1",
  Organic: "#22c55e",
  Mixed: "#64748b",
  Metal: "#a3a3a3",
  Electronic: "#d946ef",
  Glass: "#38bdf8",
};

export default function WasteAnalyticsPage() {
  const metrics = useMemo(() => calculateWasteMetrics(), []);

  const [riverId, setRiverId] = useState("river-musi");

  const riverComposition = useMemo(() => {
    const riverWaste = wasteRecords.filter((w) => w.riverId === riverId);
    const total = riverWaste.reduce((s, w) => s + w.weightKg, 0) || 1;
    const map = new Map<WasteCategory, number>();
    riverWaste.forEach((w) => map.set(w.category, (map.get(w.category) ?? 0) + w.weightKg));
    return [...map.entries()]
      .map(([category, weightKg]) => ({
        category,
        weightKg,
        percentage: Math.round((weightKg / total) * 1000) / 10,
      }))
      .sort((a, b) => b.weightKg - a.weightKg);
  }, [riverId]);

  const pipelineFlow = useMemo(() => {
    return [
      { stage: "Detected", value: metrics.detected },
      { stage: "Collected", value: metrics.collected },
      { stage: "Transported", value: metrics.transported },
      { stage: "Treated", value: metrics.treated },
    ];
  }, [metrics]);

  const recordsByRiver = useMemo(() => {
    return rivers
      .map((r) => ({
        name: r.name,
        displayName: r.displayName,
        kg: wasteRecords.filter((w) => w.riverId === r.id).reduce((s, w) => s + w.weightKg, 0),
      }))
      .filter((r) => r.kg > 0);
  }, []);

  const wasteTable = useMemo(() => {
    return wasteRecords
      .map((w) => ({ ...w }))
      .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
      .slice(0, 10);
  }, []);

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
                Waste Analytics
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Composition, pipeline flow and recent detection records.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Waste Detected" value={metrics.detected.toLocaleString()} unit="kg" icon={<ScanLine className="h-4 w-4" />} description="AI detection (demo)" />
          <MetricCard title="Estimated Collected" value={metrics.collected.toLocaleString()} unit="kg" icon={<Layers className="h-4 w-4" />} description="~72% recovery estimate" />
          <MetricCard title="In Transit" value={metrics.inTransit} unit="jobs" icon={<Truck className="h-4 w-4" />} description="Currently being transported" />
          <MetricCard title="Treated / Disposed" value={metrics.treated.toLocaleString()} unit="kg" icon={<Recycle className="h-4 w-4" />} description={`${metrics.verified} awaiting verification`} />
        </div>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pipeline Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineFlow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="stage" tick={{ fontSize: 12, fill: "#334155" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip
                      formatter={(value) => [`${Number(value ?? 0).toLocaleString()} kg`, "Weight"]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                    />
                    <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]}>
                      {pipelineFlow.map((entry, i) => (
                        <Cell
                          key={entry.stage}
                          fill={["#0891b2", "#0d9488", "#059669", "#22c55e"][i] ?? "#0d9488"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Collected and treated values are prototype estimates derived from demo operational data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-sm">Composition by Category</CardTitle>
                <div className="inline-flex h-8 items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
                  {rivers.filter((r) => wasteRecords.some((w) => w.riverId === r.id)).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRiverId(r.id)}
                      className={cn(
                        "h-full rounded-md px-2.5 text-xs font-medium capitalize transition-colors",
                        riverId === r.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {riverComposition.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  Waste records are only available for the Musi River in this prototype.
                </p>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riverComposition}
                          dataKey="weightKg"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={54}
                          outerRadius={88}
                          paddingAngle={2}
                          strokeWidth={1}
                        >
                          {riverComposition.map((entry) => (
                            <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? "#64748b"} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${Number(value ?? 0).toLocaleString()} kg`,
                            String(name ?? ""),
                          ]}
                          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 w-full space-y-1.5">
                    {riverComposition.map((item) => (
                      <div key={item.category} className="flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs">
                        <span className="flex items-center gap-2 font-medium">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? "#64748b" }} />
                          {item.category}
                        </span>
                        <span className="text-slate-500">
                          {item.weightKg} kg · {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <BadgeCheck className="h-4 w-4" />
                Recent Detections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead>Disposal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wasteTable.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>
                        <span className="flex items-center gap-2 font-medium">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[w.category] ?? "#64748b" }} />
                          {w.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{w.zoneId}</TableCell>
                      <TableCell className="tabular-nums">{w.weightKg} kg</TableCell>
                      <TableCell className="tabular-nums text-slate-500">{w.confidence}%</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(w.detectedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{w.disposalRecommendation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detected by River</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recordsByRiver.map((r) => (
                  <div key={r.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{r.displayName}</span>
                      <span className="text-slate-500">{r.kg.toLocaleString()} kg</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{ width: `${Math.max(4, (r.kg / recordsByRiver[0].kg) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Only rivers with bundled demo waste records appear here.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}