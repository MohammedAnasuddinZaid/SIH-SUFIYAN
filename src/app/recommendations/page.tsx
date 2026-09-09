"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Lightbulb,
  Search,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { recommendations } from "@/lib/demo-data/analytics";
import { getZoneById } from "@/lib/demo-data/monitoring-zones";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DemoBadge } from "@/components/shared/demo-badge";

const TYPE_ICON: Record<string, typeof Sparkles> = {
  Cleanup: Sparkles,
  Investigation: Zap,
  Monitoring: Target,
  Outreach: Lightbulb,
  Sampling: Target,
};

const PRIORITY_RANK: Record<string, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

export default function RecommendationsPage() {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const sorted = useMemo(
    () => [...recommendations].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]),
    []
  );

  const counts = useMemo(
    () => ({
      Urgent: recommendations.filter((r) => r.priority === "Urgent").length,
      High: recommendations.filter((r) => r.priority === "High").length,
      Medium: recommendations.filter((r) => r.priority === "Medium").length,
      Low: recommendations.filter((r) => r.priority === "Low").length,
    }),
    []
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sorted.filter((r) => {
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (term && !`${r.title} ${r.summary} ${r.type}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [sorted, priorityFilter, search]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                AI Recommendations
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Data-driven interventions proposed by the AI analytical layer. Each
              recommendation is linked to zones and supported by signals.
            </p>
          </div>
          <Button render={<Link href="/action-center" />} className="gap-1.5">
            Convert to Action
            <ArrowRight className="h-4 w-4" />
          </Button>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Active Recommendations" value={recommendations.length} icon={<Sparkles className="h-4 w-4" />} description="Across all priorities" />
          <MetricCard title="Urgent" value={counts.Urgent} icon={<Zap className="h-4 w-4" />} description="Immediate intervention" />
          <MetricCard title="High Priority" value={counts.High} icon={<Target className="h-4 w-4" />} description="Needs scheduling" />
          <MetricCard
            title="Avg Confidence"
            value={`${Math.round(recommendations.reduce((s, r) => s + r.confidence, 0) / recommendations.length)}%`}
            unit={undefined}
            icon={<Lightbulb className="h-4 w-4" />}
            description="Model confidence"
          />
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recommendation List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search recommendations…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="inline-flex h-9 items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
                  {["all", "Urgent", "High", "Medium", "Low"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriorityFilter(p)}
                      className={cn(
                        "h-full rounded-md px-3 text-xs font-medium transition-colors",
                        priorityFilter === p
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {p === "all" ? "All" : p}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="h-5 w-5" />}
                  title="No recommendations found"
                  description="Try adjusting the priority filter or search term."
                />
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {filtered.map((rec) => {
                    const zone = getZoneById(rec.zoneId);
                    const Icon = TYPE_ICON[rec.type] ?? Lightbulb;
                    return (
                      <div
                        key={rec.id}
                        className={cn(
                          "flex flex-col rounded-xl border p-4 transition-shadow hover:shadow-sm",
                          rec.priority === "Urgent"
                            ? "border-red-200 bg-red-50/50"
                            : rec.priority === "High"
                              ? "border-orange-200 bg-orange-50/40"
                              : "border-slate-200 bg-white"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-[#0c1e3a]">{rec.title}</h3>
                              <StatusBadge status={rec.priority} variant="priority" />
                            </div>
                            <p className="mt-1 text-sm text-slate-600">{rec.summary}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-slate-500">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                              {rec.type}
                            </span>
                            <span>Zone: {zone?.name ?? rec.zoneId}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                              {rec.confidence}% confidence
                            </span>
                            <Button
                              variant="outline"
                              size="xs"
                              render={<Link href="/action-center" />}
                              className="gap-1"
                            >
                              Create action
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
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