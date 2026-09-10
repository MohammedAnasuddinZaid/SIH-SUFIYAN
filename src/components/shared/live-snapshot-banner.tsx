"use client";

import Link from "next/link";
import { Activity, ArrowRight, Radio, Siren } from "lucide-react";

import { useLiveSnapshot } from "@/lib/live-client";
import { LiveBadge } from "@/components/effects/live-badge";
import { DataFreshness } from "@/components/effects/data-freshness";

/**
 * Compact live-data strip for embedding in dashboard/home pages.
 * Shows real upstream flood-risk status from the pipeline API.
 */
export function LiveSnapshotBanner() {
  const { data, isLoading, error, refresh } = useLiveSnapshot();

  const rivers = data?.rivers ?? [];
  const highRisk = rivers.filter(
    (r) => r.floodRisk.level === "High" || r.floodRisk.level === "Critical"
  ).length;
  const averageWqi = rivers.length
    ? Math.round(rivers.reduce((s, r) => s + r.waterQuality.wqi, 0) / rivers.length)
    : 0;
  const mode = data?.mode ?? "simulated";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-r from-[#0c1e3a] via-[#0e2a4a] to-[#0c6b58] p-5 shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(600px 200px at 90% 0%, rgba(34,211,238,0.3), transparent 60%)",
        }}
      />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
            <Radio className="h-5 w-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-white">
                Live river telemetry
              </p>
              <LiveBadge
                status={
                  mode === "live" ? "live" : mode === "hybrid" ? "estimated" : "simulated"
                }
              />
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              Real-time discharge & rainfall from ECMWF GloFAS / Open-Meteo ·
              model-derived flood risk and water-quality estimates.
            </p>
            {error && (
              <p className="mt-1 text-xs text-amber-300">
                Upstream unavailable — showing deterministic simulation.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <Siren className="h-4 w-4 text-red-300" />
            <div>
              <p className="text-lg font-extrabold text-white">{highRisk}</p>
              <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                High / critical risk
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-300" />
            <div>
              <p className="text-lg font-extrabold text-white">{averageWqi}</p>
              <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                Avg WQI (est.)
              </p>
            </div>
          </div>
          <DataFreshness
            updatedAt={data?.generatedAt ?? null}
            isLoading={isLoading}
            onRefresh={refresh}
            className="border-white/15 bg-white/5 text-slate-200"
          />
          <Link
            href="/flood-risk"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-400"
          >
            Flood Watch
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}