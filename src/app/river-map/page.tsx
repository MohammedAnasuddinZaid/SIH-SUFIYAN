"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  ScaleControl,
  FullscreenControl,
} from "react-map-gl/maplibre";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import {
  AlertTriangle,
  Calendar,
  Eye,
  Filter,
  Flame,
  ListChecks,
  MapPin,
  Search,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { rivers } from "@/lib/demo-data/rivers";
import { pollutionReports } from "@/lib/demo-data/reports";
import {
  getRiverById,
  getZonesByRiverSelector,
  getMonitoringZoneStats,
  getActiveReportCount,
} from "@/lib/selectors";
import type { MonitoringZone } from "@/lib/types";
import {
  monitoringZonesToGeoJSON,
  riverPathToGeoJSON,
  reportsToGeoJSON,
} from "@/lib/map-utils";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { MapSkeleton } from "@/components/shared/loading-skeleton";
import { DemoBadge } from "@/components/shared/demo-badge";

function resolveRiverId(input: string | null): string {
  if (!input) return "river-musi";
  if (rivers.some((r) => r.id === input)) return input;
  const byName = rivers.find(
    (r) => r.name.toLowerCase() === input.toLowerCase()
  );
  return byName ? byName.id : "river-musi";
}

function zoneSeverity(
  pollutionLevel: number
): "Low" | "Moderate" | "High" | "Critical" {
  if (pollutionLevel <= 35) return "Low";
  if (pollutionLevel <= 55) return "Moderate";
  if (pollutionLevel <= 75) return "High";
  return "Critical";
}

function matchesWasteFilter(primaryWaste: string, filter: string): boolean {
  if (filter === "all") return true;
  const lower = primaryWaste.toLowerCase();
  switch (filter) {
    case "Plastic":
      return lower.includes("plastic");
    case "Organic":
      return lower.includes("organic");
    case "Industrial":
      return lower.includes("industrial");
    case "Sewage":
      return lower.includes("sewage") || lower.includes("domestic");
    case "Mixed":
      return lower.includes("mixed");
    case "Metal":
      return lower.includes("metal");
    default:
      return true;
  }
}

const SEVERITY_FILTER_OPTIONS = [
  { value: "all", label: "All Severity" },
  { value: "Low", label: "Low" },
  { value: "Moderate", label: "Moderate" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

const RISK_FILTER_OPTIONS = [
  { value: "all", label: "All Risks" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const WASTE_FILTER_OPTIONS = [
  { value: "all", label: "All Waste Types" },
  { value: "Plastic", label: "Plastic" },
  { value: "Organic", label: "Organic" },
  { value: "Industrial", label: "Industrial" },
  { value: "Sewage", label: "Sewage" },
  { value: "Mixed", label: "Mixed" },
  { value: "Metal", label: "Metal" },
];

const SEV_DOT: Record<string, string> = {
  Low: "bg-green-500",
  Moderate: "bg-yellow-500",
  High: "bg-orange-500",
  Critical: "bg-red-500",
};

function StatsStrip({
  total,
  low,
  medium,
  high,
  critical,
  activeReports,
}: {
  total: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
  activeReports: number;
}) {
  const items = [
    { label: "Zones", value: total, dot: "bg-slate-500" },
    { label: "Low", value: low, dot: "bg-green-500" },
    { label: "Moderate", value: medium, dot: "bg-yellow-500" },
    { label: "High", value: high, dot: "bg-orange-500" },
    { label: "Critical", value: critical, dot: "bg-red-500" },
    { label: "Reports", value: activeReports, dot: "bg-sky-500" },
  ];

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-white px-4 py-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs">
          <span className={cn("h-2 w-2 rounded-full", item.dot)} />
          <span className="text-slate-500">{item.label}</span>
          <span className="font-semibold tabular-nums text-slate-800">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function SearchOverlay({
  zones,
  onSelect,
}: {
  zones: MonitoringZone[];
  onSelect: (zoneId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const term = query.toLowerCase();
    return zones.filter((z) => z.name.toLowerCase().includes(term));
  }, [zones, query]);

  return (
    <div className="absolute top-3 left-3 z-10">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search monitoring zone..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-64 pl-8 shadow-md"
        />
        {isOpen && filtered.length > 0 && (
          <div className="absolute top-full left-0 z-20 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg">
            {filtered.slice(0, 5).map((zone) => (
              <button
                key={zone.id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(zone.id);
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{zone.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPanel({
  severityFilter,
  onSeverityChange,
  riskFilter,
  onRiskChange,
  wasteFilter,
  onWasteChange,
  severityItems,
  riskItems,
  wasteItems,
}: {
  severityFilter: string;
  onSeverityChange: (v: string) => void;
  riskFilter: string;
  onRiskChange: (v: string) => void;
  wasteFilter: string;
  onWasteChange: (v: string) => void;
  severityItems: Record<string, string>;
  riskItems: Record<string, string>;
  wasteItems: Record<string, string>;
}) {
  return (
    <div className="absolute top-3 right-14 z-10 w-64 rounded-xl border bg-white p-4 shadow-lg">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Filters
      </h3>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Severity
          </label>
          <Select
            value={severityFilter}
            items={severityItems}
            onValueChange={(v) => onSeverityChange(String(v))}
          >
            <SelectTrigger className="w-full" aria-label="Filter by severity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Risk Level
          </label>
          <Select
            value={riskFilter}
            items={riskItems}
            onValueChange={(v) => onRiskChange(String(v))}
          >
            <SelectTrigger className="w-full" aria-label="Filter by risk">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RISK_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Waste Type
          </label>
          <Select
            value={wasteFilter}
            items={wasteItems}
            onValueChange={(v) => onWasteChange(String(v))}
          >
            <SelectTrigger className="w-full" aria-label="Filter by waste type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WASTE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 rounded-xl border bg-white p-3 shadow-lg">
      <h4 className="mb-2 text-xs font-semibold text-slate-700">Legend</h4>
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Pollution Level
        </p>
        {(["Low", "Moderate", "High", "Critical"] as const).map((level) => (
          <div key={level} className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", SEV_DOT[level])} />
            <span className="text-xs text-slate-600">{level}</span>
          </div>
        ))}
        <div className="my-1 border-t" />
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-slate-500 shadow-sm" />
          </span>
          <span className="text-xs text-slate-600">Monitoring Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0ea5e9] shadow-sm" />
          </span>
          <span className="text-xs text-slate-600">Citizen Report</span>
        </div>
      </div>
    </div>
  );
}

function ZonePopup({
  zone,
  riverId,
  onClose,
}: {
  zone: MonitoringZone;
  riverId: string;
  onClose: () => void;
}) {
  return (
    <div className="w-64 space-y-2 p-1">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight text-slate-900">
          {zone.name}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close popup"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Pollution Level</span>
          <span className="font-medium">{zone.pollutionLevel}%</span>
        </div>
        <div className="flex justify-between">
          <span>Water Quality</span>
          <span className="font-medium">{zone.waterQualityScore}/100</span>
        </div>
        <div className="flex justify-between">
          <span>Primary Waste</span>
          <span className="font-medium">{zone.primaryWaste}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Risk</span>
          <StatusBadge status={zone.riskLevel} variant="risk" />
        </div>
      </div>
      {zone.recommendedAction && (
        <p className="text-[11px] leading-relaxed text-slate-500">
          <span className="font-medium text-slate-600">Action: </span>
          {zone.recommendedAction}
        </p>
      )}
      <div className="flex gap-1.5 pt-1">
        <Link
          href={`/dashboard?river=${riverId}&zone=${zone.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "xs" }),
            "gap-1"
          )}
        >
          <Eye className="h-3 w-3" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}

function ZoneHistoryDialog({ zone }: { zone: MonitoringZone }) {
  const [open, setOpen] = useState(false);

  const events = [
    {
      date: zone.lastInspection,
      title: "Last Inspection",
      desc: `Routine inspection completed for ${zone.name}.`,
    },
    {
      date: "2026-08-15",
      title: "Water Quality Alert",
      desc: "WQI dropped below acceptable threshold.",
    },
    {
      date: "2026-07-20",
      title: "Cleanup Action",
      desc: "Waste removal and bank cleanup completed.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="gap-1" />}
      >
        <Calendar className="h-3.5 w-3.5" />
        History
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zone History</DialogTitle>
          <DialogDescription>
            Recent events for {zone.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-0">
          {events.map((ev, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center pt-0.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                {i < events.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200" />
                )}
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium text-slate-800">
                  {ev.title}
                </p>
                <p className="text-xs text-slate-400">{ev.date}</p>
                <p className="mt-0.5 text-xs text-slate-500">{ev.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ZoneDetailContent({
  zone,
  riverId,
  onFlyTo,
}: {
  zone: MonitoringZone;
  riverId: string;
  onFlyTo: () => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{zone.name}</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Water Quality Index: {zone.waterQualityScore}/100
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Pollution Level
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
            {zone.pollutionLevel}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Risk Level
          </p>
          <div className="mt-1.5">
            <StatusBadge status={zone.riskLevel} variant="risk" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <InfoRow label="Primary Waste" value={zone.primaryWaste} />
        <InfoRow label="Last Inspection" value={zone.lastInspection} />
        <InfoRow label="Recommended Action" value={zone.recommendedAction} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={onFlyTo}
        >
          <MapPin className="h-3.5 w-3.5" />
          Open on Map
        </Button>
        <ZoneHistoryDialog zone={zone} />
        <Link
          href="/action-center"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1"
          )}
        >
          <ListChecks className="h-3.5 w-3.5" />
          Create Action
        </Link>
        <Link
          href={`/report-pollution?zone=${zone.id}&river=${riverId}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Report Issue
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function ZoneTable({ zones }: { zones: MonitoringZone[] }) {
  if (zones.length === 0) return null;
  return (
    <section className="border-t bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-base font-semibold text-slate-800">
          Monitoring Zones &mdash; Accessible View
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>WQI</TableHead>
              <TableHead>Pollution</TableHead>
              <TableHead>Primary Waste</TableHead>
              <TableHead>Last Inspection</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell className="font-medium">{zone.name}</TableCell>
                <TableCell>
                  <StatusBadge status={zone.riskLevel} variant="risk" />
                </TableCell>
                <TableCell className="tabular-nums">
                  {zone.waterQualityScore}/100
                </TableCell>
                <TableCell className="tabular-nums">
                  {zone.pollutionLevel}%
                </TableCell>
                <TableCell>{zone.primaryWaste}</TableCell>
                <TableCell className="text-slate-500">
                  {zone.lastInspection}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function MapWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);

  const rawRiver = searchParams.get("river");
  const riverId = resolveRiverId(rawRiver);
  const zoneParam = searchParams.get("zone");
  const severityParam = searchParams.get("severity");

  const validSeverities = ["all", "Low", "Moderate", "High", "Critical"];
  const initialSeverity =
    severityParam && validSeverities.includes(severityParam)
      ? severityParam
      : "all";

  const river = getRiverById(riverId);
  const allZones = getZonesByRiverSelector(riverId);
  const allReports = pollutionReports.filter((r) => r.riverId === riverId);
  const stats = getMonitoringZoneStats(riverId);
  const activeReportCount = getActiveReportCount(riverId);

  const selectedZone = zoneParam
    ? (allZones.find((z) => z.id === zoneParam) ?? null)
    : null;
  const [severityFilter, setSeverityFilter] = useState(initialSeverity);
  const [riskFilter, setRiskFilter] = useState("all");
  const [wasteFilter, setWasteFilter] = useState("all");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const initialZoneFlown = useRef(false);

  const filteredZones = allZones.filter((zone) => {
    if (
      severityFilter !== "all" &&
      zoneSeverity(zone.pollutionLevel) !== severityFilter
    )
      return false;
    if (riskFilter !== "all" && zone.riskLevel !== riskFilter) return false;
    if (!matchesWasteFilter(zone.primaryWaste, wasteFilter)) return false;
    return true;
  });

  const filteredReports =
    severityFilter === "all"
      ? allReports
      : allReports.filter((r) => r.severity === severityFilter);

  const zonesGeoJSON = monitoringZonesToGeoJSON(filteredZones);
  const riverGeoJSON = riverPathToGeoJSON(allZones);
  const reportsGeoJSON = reportsToGeoJSON(filteredReports);

  const firstZone = allZones[0];
  const initialViewState = {
    longitude: firstZone?.longitude ?? 78.4,
    latitude: firstZone?.latitude ?? 17.4,
    zoom: 10,
  };

  useEffect(() => {
    if (mapLoaded && zoneParam && !initialZoneFlown.current) {
      const zone = allZones.find((z) => z.id === zoneParam);
      if (zone) {
        mapRef.current?.flyTo({
          center: [zone.longitude, zone.latitude],
          zoom: 13,
        });
        initialZoneFlown.current = true;
      }
    }
  }, [mapLoaded, zoneParam, allZones]);

  const updateUrlParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/river-map?${params.toString()}`, { scroll: false });
  };

  const handleSelectZone = (zone: MonitoringZone) => {
    updateUrlParam("zone", zone.id);
    mapRef.current?.flyTo({
      center: [zone.longitude, zone.latitude],
      zoom: 13,
    });
  };

  const handleDeselectZone = () => {
    updateUrlParam("zone", null);
  };

  const handleMapClick = (e: MapLayerMouseEvent) => {
    const zoneFeatures = e.target.queryRenderedFeatures(e.point, {
      layers: ["zones-layer"],
    });
    if (zoneFeatures && zoneFeatures.length > 0) {
      const zoneId = zoneFeatures[0].properties?.id as string | undefined;
      if (zoneId) {
        const zone = allZones.find((z) => z.id === zoneId);
        if (zone) {
          handleSelectZone(zone);
          return;
        }
      }
    }
    handleDeselectZone();
  };

  const handleMapLoad = () => {
    setMapLoaded(true);
    setMapError(false);
  };

  const handleMapError = () => {
    setMapError(true);
  };

  const handleSearchSelect = (zoneId: string) => {
    const zone = allZones.find((z) => z.id === zoneId);
    if (zone) handleSelectZone(zone);
  };

  const severityItems: Record<string, string> = {};
  SEVERITY_FILTER_OPTIONS.forEach((o) => {
    severityItems[o.value] = o.label;
  });

  const riskItems: Record<string, string> = {};
  RISK_FILTER_OPTIONS.forEach((o) => {
    riskItems[o.value] = o.label;
  });

  const wasteItems: Record<string, string> = {};
  WASTE_FILTER_OPTIONS.forEach((o) => {
    wasteItems[o.value] = o.label;
  });

  if (!river) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          icon={<AlertTriangle className="h-5 w-5" />}
          title="River not found"
          description="The specified river could not be found in our system."
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-[#0c1e3a]">
            {river.displayName}
          </h1>
          <DemoBadge />
        </div>
        <div className="ml-auto">
          <Select
            value={river.name.toLowerCase()}
            items={Object.fromEntries(
              rivers.map((r) => [r.name.toLowerCase(), r.displayName])
            )}
            onValueChange={(v) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("river", String(v));
              params.delete("zone");
              router.replace(`/river-map?${params.toString()}`, {
                scroll: false,
              });
              initialZoneFlown.current = false;
            }}
          >
            <SelectTrigger className="w-40" aria-label="Select river">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rivers.map((r) => (
                <SelectItem key={r.id} value={r.name.toLowerCase()}>
                  {r.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <StatsStrip
        total={stats.total}
        low={stats.low}
        medium={stats.medium}
        high={stats.high}
        critical={stats.critical}
        activeReports={activeReportCount}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative h-[65vh] min-h-0 flex-1 lg:h-auto">
          {mapError ? (
            <div className="flex h-full items-center justify-center bg-slate-50">
              <EmptyState
                icon={<AlertTriangle className="h-5 w-5" />}
                title="Map failed to load"
                description="There was a problem loading the map. The zone data is still available below."
              />
            </div>
          ) : (
            <Map
              ref={mapRef}
              mapLib={maplibregl}
              mapStyle="https://demotiles.maplibre.org/style.json"
              initialViewState={initialViewState}
              onLoad={handleMapLoad}
              onError={handleMapError}
              onClick={handleMapClick}
              interactiveLayerIds={["zones-layer"]}
              style={{ width: "100%", height: "100%" }}
            >
              <NavigationControl position="top-right" />
              <ScaleControl position="bottom-left" />
              <FullscreenControl position="top-right" />

              <Source id="river-path" type="geojson" data={riverGeoJSON}>
                <Layer
                  id="river-line"
                  type="line"
                  paint={{
                    "line-color": "#1e40af",
                    "line-width": 3,
                    "line-opacity": 0.8,
                  }}
                />
              </Source>

              <Source
                id="zones-source"
                type="geojson"
                data={zonesGeoJSON}
                cluster
                clusterMaxZoom={14}
                clusterRadius={50}
              >
                <Layer
                  id="clusters"
                  type="circle"
                  filter={["has", "point_count"]}
                  paint={{
                    "circle-color": [
                      "step",
                      ["get", "point_count"],
                      "#86efac",
                      5,
                      "#fde68a",
                      15,
                      "#fca5a5",
                    ],
                    "circle-radius": [
                      "step",
                      ["get", "point_count"],
                      20,
                      5,
                      30,
                      15,
                      40,
                    ],
                  }}
                />
                <Layer
                  id="cluster-count"
                  type="symbol"
                  filter={["has", "point_count"]}
                  layout={{
                    "text-field": "{point_count_abbreviated}",
                    "text-size": 12,
                  }}
                />
                <Layer
                  id="zones-layer"
                  type="circle"
                  filter={["!", ["has", "point_count"]]}
                  paint={{
                    "circle-color": [
                      "match",
                      ["get", "riskLevel"],
                      "Low",
                      "#16a34a",
                      "Medium",
                      "#eab308",
                      "High",
                      "#f97316",
                      "Critical",
                      "#dc2626",
                      "#64748b",
                    ],
                    "circle-radius": 8,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#fff",
                  }}
                />
                {showHeatmap && (
                  <Layer
                    id="zones-heatmap"
                    type="heatmap"
                    paint={{
                      "heatmap-weight": [
                        "interpolate",
                        ["linear"],
                        ["get", "waterQualityScore"],
                        0,
                        10,
                        100,
                        0,
                      ],
                      "heatmap-intensity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0,
                        1,
                        15,
                        3,
                      ],
                      "heatmap-color": [
                        "interpolate",
                        ["linear"],
                        ["heatmap-density"],
                        0,
                        "rgba(33,102,172,0)",
                        0.2,
                        "rgb(103,169,207)",
                        0.4,
                        "rgb(209,229,240)",
                        0.6,
                        "rgb(253,219,199)",
                        0.8,
                        "rgb(244,109,67)",
                        1,
                        "rgb(165,0,38)",
                      ],
                      "heatmap-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0,
                        2,
                        15,
                        20,
                      ],
                    }}
                  />
                )}
              </Source>

              <Source
                id="reports-source"
                type="geojson"
                data={reportsGeoJSON}
              >
                <Layer
                  id="reports-layer"
                  type="circle"
                  paint={{
                    "circle-color": "#0ea5e9",
                    "circle-radius": 6,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#fff",
                  }}
                />
              </Source>

              {selectedZone && (
                <>
                  <Popup
                    longitude={selectedZone.longitude}
                    latitude={selectedZone.latitude}
                    anchor="bottom"
                    offset={20}
                    onClose={handleDeselectZone}
                    className="!rounded-xl !shadow-lg"
                  >
                    <ZonePopup
                      zone={selectedZone}
                      riverId={riverId}
                      onClose={handleDeselectZone}
                    />
                  </Popup>
                  <Source
                    id="selected-source"
                    type="geojson"
                    data={monitoringZonesToGeoJSON([selectedZone])}
                  >
                    <Layer
                      id="selected-layer"
                      type="circle"
                      paint={{
                        "circle-color": "rgba(255,255,255,0)",
                        "circle-radius": 18,
                        "circle-stroke-width": 3,
                        "circle-stroke-color": "#ffffff",
                      }}
                    />
                  </Source>
                </>
              )}
            </Map>
          )}

          <SearchOverlay zones={allZones} onSelect={handleSearchSelect} />

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "absolute top-3 right-1 z-10 flex h-8 items-center gap-1.5 rounded-lg border bg-white px-2.5 text-xs font-medium shadow-md transition-colors",
              showFilters
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>

          {showFilters && (
            <FilterPanel
              severityFilter={severityFilter}
              onSeverityChange={setSeverityFilter}
              riskFilter={riskFilter}
              onRiskChange={setRiskFilter}
              wasteFilter={wasteFilter}
              onWasteChange={setWasteFilter}
              severityItems={severityItems}
              riskItems={riskItems}
              wasteItems={wasteItems}
            />
          )}

          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn(
              "absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium shadow-md transition-colors",
              showHeatmap
                ? "border-red-200 bg-red-50 text-red-700"
                : "border bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <Flame className="h-3.5 w-3.5" />
            {showHeatmap ? "Hide" : "Show"} Pollution Hotspots
          </button>
          {showHeatmap && (
            <span className="absolute bottom-14 right-4 z-10 rounded-md bg-white/90 px-2 py-1 text-[10px] text-slate-500 shadow-sm">
              Prototype risk visualization
            </span>
          )}

          <Legend />
        </div>

        <div className="hidden w-96 shrink-0 overflow-y-auto border-l bg-white lg:block">
          {selectedZone ? (
            <ZoneDetailContent
              zone={selectedZone}
              riverId={riverId}
              onFlyTo={() => handleSelectZone(selectedZone)}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <EmptyState
                icon={<MapPin className="h-5 w-5" />}
                title="No zone selected"
                description="Click a monitoring zone on the map to view its details."
              />
            </div>
          )}
        </div>

        {selectedZone && (
          <Sheet
            open={!!selectedZone}
            onOpenChange={(open) => {
              if (!open) handleDeselectZone();
            }}
          >
            <SheetContent side="bottom" className="max-h-[70vh] lg:hidden">
              <SheetHeader>
                <SheetTitle>{selectedZone.name}</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto">
                <ZoneDetailContent
                  zone={selectedZone}
                  riverId={riverId}
                  onFlyTo={() => handleSelectZone(selectedZone)}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <ZoneTable zones={allZones} />
    </div>
  );
}

export default function RiverMapPage() {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <MapWorkspace />
    </Suspense>
  );
}
