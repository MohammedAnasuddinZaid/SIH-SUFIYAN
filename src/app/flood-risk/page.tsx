"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CloudRain,
  Droplets,
  Gauge as GaugeIcon,
  Radar,
  ShieldAlert,
  Siren,
  TrendingDown,
  TrendingUp,
  Waves,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useLiveSnapshot } from "@/lib/live-client";
import { LiveBadge } from "@/components/effects/live-badge";
import { DataFreshness } from "@/components/effects/data-freshness";
import { LiveRefreshControl } from "@/components/shared/live-refresh-control";
import { TiltCard } from "@/components/effects/tilt-card";
import { AnimatedCounter } from "@/components/effects/animated-counter";
import type { RiverLiveData, FloodRiskLevel, DataSourceInfo } from "@/lib/pipeline/types";
import { cn } from "@/lib/utils";

const RISK_STYLE: Record<FloodRiskLevel, { badge: string; ring: string; text: string }> = {
  Low: { badge: "bg-emerald-100 text-emerald-700", ring: "border-emerald-200", text: "text-emerald-600" },
  Moderate: { badge: "bg-amber-100 text-amber-700", ring: "border-amber-300", text: "text-amber-600" },
  High: { badge: "bg-orange-100 text-orange-700", ring: "border-orange-300", text: "text-orange-600" },
  Critical: { badge: "bg-red-100 text-red-700", ring: "border-red-300", text: "text-red-600" },
};

function chartData(river: RiverLiveData) {
  const history = river.discharge.history.map((p) => {
    const month = p.date.slice(5).replace("-", "/");
    return { name: month, observed: p.value };
  });
  const forecast = river.discharge.forecast.map((p) => {
    const month = p.date.slice(5).replace("-", "/");
    return {
      name: month,
      forecastMean: p.mean,
      forecastMin: p.min,
      forecastMax: p.max,
    };
  });
  const joined: Array<{ name: string; observed?: number; forecastMean?: number; forecastMin?: number; forecastMax?: number }> =
    [...history.slice(-10), ...forecast];
  return joined;
}

export default function FloodRiskPage() {
  const [refreshMs, setRefreshMs] = useState(120_000);
  const { data, isLoading, error, refreshedAt, refresh } = useLiveSnapshot({
    refreshMs,
  });

  const rivers = data?.rivers ?? [];
  const highRisk = rivers.filter(
    (r) => r.floodRisk.level === "High" || r.floodRisk.level === "Critical"
  ).length;
  const liveSources = data?.sources.filter((s) => s.isLive).length ?? 0;
  const zones = data?.zones ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Hero
        isLoading={isLoading}
        error={error}
        refreshedAt={refreshedAt ? refreshedAt.toISOString() : data?.generatedAt ?? null}
        onRefresh={refresh}
        mode={data?.mode ?? "simulated"}
        liveCount={liveSources}
        riverCount={rivers.length}
        highRisk={highRisk}
        zoneCount={zones.length}
      />

      <div className="mx-auto max-w-screen-2xl space-y-12 px-4 py-14 sm:px-6 lg:px-8">
        {/* Status strip */}
        <Strip
          rivers={rivers}
          mode={data?.mode ?? "simulated"}
          liveCount={liveSources}
        />

        {/* River board */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-teal-600 uppercase">
                <Radar className="h-4 w-4" /> Live River Board
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                Flood risk across 6 rivers
              </h2>
            </div>
            <p className="max-w-sm text-sm text-slate-500">
              Discharge from ECMWF GloFAS v4 (real-time, 10-day forecast). Flood
              risk is model-derived from stage, momentum, rainfall and forecast peak.
            </p>
            <LiveRefreshControl value={refreshMs} onChange={setRefreshMs} className="self-start" />
          </div>

          {isLoading && rivers.length === 0 ? (
            <BoardSkeleton />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {rivers.map((river) => (
                <RiverCard key={river.riverId} river={river} />
              ))}
            </div>
          )}
        </section>

        {/* Chart detail of highest-risk river */}
        {rivers.length > 0 && <DetailSection rivers={rivers} />}

        {/* Sources & caveats */}
        <SourcesPanel sources={data?.sources ?? []} />
      </div>
    </div>
  );
}

function Hero({
  isLoading,
  error,
  refreshedAt,
  onRefresh,
  mode,
  liveCount,
  riverCount,
  highRisk,
  zoneCount,
}: {
  isLoading: boolean;
  error: string | null;
  refreshedAt: string | null;
  onRefresh: () => void;
  mode: string;
  liveCount: number;
  riverCount: number;
  highRisk: number;
  zoneCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0c1e3a]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1000px 520px at 80% -10%, rgba(34,211,238,0.32), transparent 60%), radial-gradient(900px 480px at 0% 0%, rgba(16,185,129,0.25), transparent 55%), radial-gradient(700px 500px at 95% 110%, rgba(30,64,175,0.4), transparent 60%)",
        }}
      />
      <div className="aurora-blob h-72 w-72 bg-teal-500/40 top-10 left-[12%] animate-float" />
      <div className="relative mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <LiveBadge status={mode === "live" ? "live" : mode === "hybrid" ? "estimated" : "simulated"} />
          <span className="rounded-full border border-white/15 px-3 py-1 text-slate-300">
            <span className="inline-block h-2 w-2 rounded-full bg-teal-400" /> {liveCount} live data source
            {liveCount !== 1 ? "s" : ""}
          </span>
        </div>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Flood Watch <span className="text-gradient-water">Command Center</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Real-time river discharge, 10-day flood forecasts and early-warning risk
          scores for India&apos;s major rivers — powered by the free ECMWF GloFAS
          global flood modeling service.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <DataFreshness
            updatedAt={refreshedAt}
            isLoading={isLoading}
            onRefresh={onRefresh}
            className="border-white/15 bg-white/5 text-slate-200"
          />
          {error && (
            <span className="text-xs text-red-300">
              Live feed unavailable — showing deterministic simulation
            </span>
          )}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HeroStat icon={Waves} label="Rivers under watch" value={riverCount} />
          <HeroStat
            icon={Siren}
            label="High / Critical risk"
            value={highRisk}
            accent
          />
          <HeroStat
            icon={Droplets}
            label="Monitoring zones"
            value={zoneCount}
          />
          <HeroStat icon={GaugeIcon} label="Flood lead time" value="24 h" />
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl",
          accent ? "bg-red-500/20 text-red-300" : "bg-white/10 text-teal-300"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-3xl font-extrabold text-white">
        {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
      </p>
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
    </div>
  );
}

function Strip({
  rivers,
  mode,
  liveCount,
}: {
  rivers: RiverLiveData[];
  mode: string;
  liveCount: number;
}) {
  const maxScore = rivers.reduce((m, r) => Math.max(m, r.floodRisk.score), 0);
  const topRiver = rivers.find((r) => r.floodRisk.score === maxScore);
  const rain = rivers.reduce((s, r) => s + r.rainfall.last24h, 0) / Math.max(1, rivers.length);
  const wqi = Math.round(rivers.reduce((s, r) => s + r.waterQuality.wqi, 0) / Math.max(1, rivers.length));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <InfoTile
        icon={Siren}
        label="Highest flood risk"
        value={topRiver ? `${topRiver.riverName} · ${topRiver.floodRisk.score}/100` : "—"}
        hint={topRiver ? topRiver.floodRisk.level : "No data"}
      />
      <InfoTile
        icon={CloudRain}
        label="Avg 24h rainfall"
        value={`${rain.toFixed(1)} mm`}
        hint="catchment-wide"
      />
      <InfoTile
        icon={Droplets}
        label="Avg water quality"
        value={`${wqi}/100`}
        hint="estimated WQI"
      />
      <InfoTile
        icon={mode === "simulated" ? Activity : GaugeIcon}
        label="Data mode"
        value={mode === "live" ? "Full live" : mode === "hybrid" ? "Hybrid" : "Simulated"}
        hint={`${liveCount} upstream source${liveCount !== 1 ? "s" : ""} online`}
      />
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-sm font-bold text-[#0c1e3a]">{value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function RiverCard({ river }: { river: RiverLiveData }) {
  const risk = RISK_STYLE[river.floodRisk.level];
  const dischargeTrend =
    river.discharge.history[river.discharge.history.length - 1]?.value >
    river.discharge.history[river.discharge.history.length - 8]?.value
      ? "up"
      : "down";
  const pct =
    river.discharge.history.length > 1
      ? ((river.discharge.current -
          river.discharge.history[river.discharge.history.length - 8].value) /
          Math.max(1, river.discharge.history[river.discharge.history.length - 8].value)) *
        100
      : 0;

  return (
    <TiltCard className="rounded-2xl">
      <Link
        href="/flood-risk"
        className={cn(
          "group block h-full rounded-2xl border-2 bg-white p-6 shadow-md backdrop-blur-sm transition-shadow hover:shadow-xl",
          risk.ring
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[#0c1e3a]">
              {river.riverName}
            </h3>
            <p className="text-xs text-slate-500">
              {river.gauge.lat.toFixed(2)}°N, {river.gauge.lon.toFixed(2)}°E
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase",
              risk.badge
            )}
          >
            {river.floodRisk.level}
          </span>
        </div>

        {/* Score gauge */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-slate-500">Flood risk score</span>
            <span className={cn("text-2xl font-extrabold", risk.text)}>
              {river.floodRisk.score}
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                river.floodRisk.level === "Critical"
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : river.floodRisk.level === "High"
                    ? "bg-gradient-to-r from-orange-400 to-orange-500"
                    : river.floodRisk.level === "Moderate"
                      ? "bg-gradient-to-r from-amber-400 to-orange-400"
                      : "bg-gradient-to-r from-emerald-400 to-teal-500"
              )}
              style={{ width: `${river.floodRisk.score}%` }}
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <MiniMetric
            label="Discharge"
            icon={GaugeIcon}
            value={river.discharge.current.toLocaleString()}
            unit="m³/s"
            trend={dischargeTrend}
            trendPct={pct}
          />
          <MiniMetric
            label="24h rainfall"
            icon={CloudRain}
            value={river.rainfall.last24h.toFixed(1)}
            unit="mm"
          />
          <MiniMetric
            label="Forecast peak"
            icon={ArrowUpRight}
            value={Math.max(...river.discharge.forecast.map((f) => f.max))
              .toLocaleString()}
            unit="m³/s"
          />
          <MiniMetric
            label="Water quality"
            icon={Droplets}
            value={String(river.waterQuality.wqi)}
            unit={`/100 · ${river.waterQuality.status}`}
          />
        </div>

        {river.floodRisk.drivers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {river.floodRisk.drivers.map((driver) => (
              <span
                key={driver}
                className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"
              >
                {driver.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">
            Peak {river.discharge.peakDay ? river.discharge.peakDay.slice(5).replace("-", "/") : "—"}
            {" · "}
            {river.discharge.peakRatio ? `${river.discharge.peakRatio.toFixed(1)}× current` : ""}
          </span>
          <LiveBadge status="estimated" />
        </div>
      </Link>
    </TiltCard>
  );
}

function MiniMetric({
  label,
  icon: Icon,
  value,
  unit,
  trend,
  trendPct,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  unit?: string;
  trend?: "up" | "down";
  trendPct?: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
        <Icon className="h-3 w-3" /> {label}
        {trend && (
          <span className={cn("flex items-center gap-0.5", trend === "up" ? "text-red-500" : "text-emerald-600")}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trendPct ?? 0) < 0.5 ? "" : `${Math.round(trendPct ?? 0)}%`}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm font-bold text-[#0c1e3a]">
        {value}
        {unit && <span className="ml-0.5 text-[11px] font-medium text-slate-500">{unit}</span>}
      </p>
    </div>
  );
}

function DetailSection({ rivers }: { rivers: RiverLiveData[] }) {
  const featured = [...rivers].sort((a, b) => b.floodRisk.score - a.floodRisk.score)[0];
  if (!featured) return null;
  const data = chartData(featured);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-teal-600 uppercase">
            <TrendingUp className="h-4 w-4" /> Discharge outlook
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#0c1e3a]">
            {featured.riverName} — observed to forecast
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Last 10 days observed (m³/s) plus 10-day GloFAS forecast envelope.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-500" /> observed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-400" /> forecast mean
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-200" /> min–max band
          </span>
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={56} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="observed"
              stroke="#14b8a6"
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="forecastMin"
              stroke="#c7d2fe"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="forecastMax"
              stroke="#c7d2fe"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="forecastMean"
              stroke="#6366f1"
              strokeWidth={2.5}
              strokeDasharray="3 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatBox label="Current discharge" value={`${featured.discharge.current.toLocaleString()} m³/s`} />
        <StatBox
          label="Forecast peak"
          value={`${(featured.discharge.forecast.length ? Math.max(...featured.discharge.forecast.map((f) => f.max)) : featured.discharge.current).toLocaleString()} m³/s`}
        />
        <StatBox label="Risk score" value={`${featured.floodRisk.score}/100 · ${featured.floodRisk.level}`} />
      </div>
    </section>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#0c1e3a]">{value}</p>
    </div>
  );
}

function SourcesPanel({ sources }: { sources: DataSourceInfo[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-teal-600" />
        <h2 className="text-base font-bold text-[#0c1e3a]">Data provenance & integrity</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {sources.map((source) => (
          <div key={source.key} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#0c1e3a]">{source.name}</p>
              <LiveBadge status={source.status} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{source.note}</p>
            {source.license && (
              <p className="mt-2 text-[11px] text-slate-400">{source.license}</p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Flood risk scores and water-quality estimates are model-derived from real
        hydrology and are for early-warning demonstration, not regulatory use.
      </p>
    </section>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-shimmer rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-sm">
          <div className="h-5 w-2/5 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
          <div className="mt-6 h-14 rounded bg-slate-100" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-16 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}