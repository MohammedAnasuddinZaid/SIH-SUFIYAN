"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Factory,
  MapPin,
  Radar,
  Search,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { anomalies, pollutionSources } from "@/lib/demo-data/analytics";
import { pollutionReports } from "@/lib/demo-data/reports";
import { monitoringZones } from "@/lib/demo-data/monitoring-zones";
import type { Severity } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DemoBadge } from "@/components/shared/demo-badge";

type AlertItem = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  source: string;
  time: string;
  href: string;
  icon: "anomaly" | "report" | "source" | "zone";
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildAlerts(): AlertItem[] {
  const alerts: AlertItem[] = [];

  anomalies.forEach((a) => {
    const zone = monitoringZones.find((z) => z.id === a.entityId);
    alerts.push({
      id: a.id,
      severity: a.severity,
      title: `${a.metric} — ${a.deviation.toFixed(2)}× above baseline`,
      detail: `${zone?.name ?? a.entityId}: observed ${a.observedValue} vs expected ${a.expectedValue}.`,
      source: "AI Anomaly Detection",
      time: a.detectedAt,
      href: "/analytics/pollution",
      icon: "anomaly",
    });
  });

  pollutionReports
    .filter((r) => r.status !== "resolved" && (r.severity === "Critical" || r.severity === "High"))
    .forEach((r) => {
      alerts.push({
        id: r.id,
        severity: r.severity,
        title: `${r.pollutionType} incident — ${r.reportNumber}`,
        detail: `${r.location}. ${r.description}`,
        source: "Pollution Report",
        time: r.submittedAt,
        href: `/reports/${r.reportNumber}`,
        icon: "report",
      });
    });

  pollutionSources
    .filter((s) => s.risk === "High" || s.risk === "Critical")
    .forEach((s) => {
      alerts.push({
        id: s.id,
        severity: s.risk === "Critical" ? "Critical" : "High",
        title: `High-risk pollution source: ${s.source}`,
        detail: `${s.incidentCount} incidents recorded; trend ${s.trend === "up" ? "rising" : s.trend === "down" ? "falling" : "stable"}. ${s.evidence}.`,
        source: "Source Intelligence",
        time: "2026-09-08T09:00:00Z",
        href: "/analytics/pollution",
        icon: "source",
      });
    });

  monitoringZones
    .filter((z) => z.riskLevel === "Critical" || z.riskLevel === "High")
    .forEach((z) => {
      alerts.push({
        id: `zone-${z.id}`,
        severity: z.riskLevel === "Critical" ? "Critical" : "High",
        title: `${z.name} at ${z.riskLevel.toLowerCase()} risk`,
        detail: `WQI ${z.waterQualityScore}/100, pollution ${z.pollutionLevel}%. ${z.recommendedAction}.`,
        source: "Zone Monitoring",
        time: `${z.lastInspection}T06:00:00Z`,
        href: "/river-map",
        icon: "zone",
      });
    });

  return alerts.sort((a, b) => {
    const rank: Record<string, number> = { Critical: 0, High: 1, Moderate: 2, Low: 3 };
    return rank[a.severity] - rank[b.severity] || b.time.localeCompare(a.time);
  });
}

const ICON_MAP = {
  anomaly: Radar,
  report: TriangleAlert,
  source: Factory,
  zone: MapPin,
};

export default function AlertsPage() {
  const alerts = useMemo(() => buildAlerts(), []);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    return {
      critical: alerts.filter((a) => a.severity === "Critical").length,
      high: alerts.filter((a) => a.severity === "High").length,
      moderate: alerts.filter((a) => a.severity === "Moderate").length,
      low: alerts.filter((a) => a.severity === "Low").length,
    };
  }, [alerts]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return alerts.filter((a) => {
      if (severityFilter !== "all" && a.severity !== severityFilter) return false;
      if (term && !`${a.title} ${a.detail} ${a.source}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [alerts, severityFilter, search]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                Alerts
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Priority notifications from anomalies, high-risk reports, pollution
              sources and monitoring zones.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Critical Alerts" value={counts.critical} icon={<TriangleAlert className="h-4 w-4" />} description="Immediate attention" />
          <MetricCard title="High Alerts" value={counts.high} icon={<BellRing className="h-4 w-4" />} description="Require action" />
          <MetricCard title="Moderate Alerts" value={counts.moderate} icon={<Radar className="h-4 w-4" />} description="Monitor closely" />
          <MetricCard title="Low Alerts" value={counts.low} icon={<Factory className="h-4 w-4" />} description="Keep under watch" />
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Alert Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search alerts…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="inline-flex h-9 items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
                  {["all", "Critical", "High", "Moderate", "Low"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverityFilter(s)}
                      className={cn(
                        "h-full rounded-md px-3 text-xs font-medium transition-colors",
                        severityFilter === s
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {s === "all" ? "All" : s}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={<BellRing className="h-5 w-5" />}
                  title="No alerts match"
                  description="Try broadening your filters or search."
                />
              ) : (
                <div className="space-y-2.5">
                  {filtered.map((alert) => {
                    const Icon = ICON_MAP[alert.icon];
                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start",
                          alert.severity === "Critical"
                            ? "border-red-200 bg-red-50/60"
                            : alert.severity === "High"
                              ? "border-orange-200 bg-orange-50/50"
                              : alert.severity === "Moderate"
                                ? "border-yellow-200 bg-yellow-50/50"
                                : "border-slate-200 bg-white"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            alert.severity === "Critical"
                              ? "bg-red-100 text-red-600"
                              : alert.severity === "High"
                                ? "bg-orange-100 text-orange-600"
                                : alert.severity === "Moderate"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-slate-100 text-slate-500"
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[#0c1e3a]">{alert.title}</h3>
                            <StatusBadge status={alert.severity} variant="severity" />
                          </div>
                          <p className="mt-1 text-sm text-slate-600">{alert.detail}</p>
                          <p className="mt-1.5 text-xs text-slate-400">
                            {alert.source} · {formatTime(alert.time)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={alert.href} />}
                          className="gap-1.5 shrink-0"
                        >
                          Review
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}