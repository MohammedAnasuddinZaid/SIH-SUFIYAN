"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Activity,
  ArrowRight,
  ChartColumn,
  CircleCheck,
  Clock3,
  Download,
  Droplets,
  ExternalLink,
  FileText,
  FlaskConical,
  Flag,
  GlassWater,
  ListChecks,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash,
  TriangleAlert,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"
import { rivers } from "@/lib/demo-data/rivers"
import { wasteRecords, getWasteByZone } from "@/lib/demo-data/waste"
import { getAnomaliesByZone, recommendations } from "@/lib/demo-data/analytics"
import {
  getHealthStatus,
  getPollutionSourceSummary,
  getPollutionTrend,
  getRiverHealthScore,
  getRiverSummary,
  getWasteComposition,
  getWaterParameterSummary,
  getWaterQualityTrend,
  getZonesByRiverSelector,
} from "@/lib/selectors"
import { getMeasurementsByRiver } from "@/lib/demo-data/water-measurements"
import type { MonitoringZone, WasteCategory, WaterParameterSummary } from "@/lib/types"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { HealthScore } from "@/components/shared/health-score"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { TrendIndicator } from "@/components/shared/trend-indicator"
import { DemoBadge } from "@/components/shared/demo-badge"
import { LiveSnapshotBanner } from "@/components/shared/live-snapshot-banner"
import { DashboardSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
]

const CATEGORY_COLORS: Record<string, string> = {
  Plastic: "#0d9488",
  Sewage: "#f59e0b",
  Industrial: "#6366f1",
  Organic: "#22c55e",
  Mixed: "#64748b",
  Metal: "#a3a3a3",
  Electronic: "#d946ef",
  Glass: "#38bdf8",
}

const PARAMETER_RANGES: Record<string, string> = {
  pH: "6.5 – 8.5",
  "Dissolved Oxygen": "≥ 6 mg/L (desirable) · 4 – 6 acceptable",
  Turbidity: "≤ 15 NTU (ideal) · 15 – 25 acceptable",
  BOD: "≤ 3 mg/L (good) · 3 – 5 acceptable",
  COD: "≤ 25 mg/L (good) · 25 – 35 acceptable",
}

const PARAMETER_FIELDS: Record<string, keyof WaterMeasurementLike> = {
  pH: "ph",
  "Dissolved Oxygen": "dissolvedOxygen",
  Turbidity: "turbidity",
  BOD: "bod",
  COD: "cod",
}

const RISK_PERCENT: Record<string, number> = {
  Low: 25,
  Medium: 50,
  High: 75,
  Critical: 95,
}

const RISK_BAR_COLOR: Record<string, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-orange-500",
  Critical: "bg-red-500",
}

const RISK_PILL: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-red-50 text-red-700",
}

interface WaterMeasurementLike {
  ph: number
  dissolvedOxygen: number
  turbidity: number
  bod: number
  cod: number
}

function resolveRiverId(input: string | null): string {
  if (!input) return "river-musi"
  if (rivers.some((r) => r.id === input)) return input
  const byName = rivers.find((r) => r.name.toLowerCase() === input.toLowerCase())
  return byName ? byName.id : "river-musi"
}

function riverShortName(riverId: string): string {
  return rivers.find((r) => r.id === riverId)?.name.toLowerCase() ?? "musi"
}

function zoneSeverity(pollutionLevel: number): "Low" | "Moderate" | "High" | "Critical" {
  if (pollutionLevel <= 35) return "Low"
  if (pollutionLevel <= 55) return "Moderate"
  if (pollutionLevel <= 75) return "High"
  return "Critical"
}

function parameterStatusClasses(status: WaterParameterSummary["status"]) {
  switch (status) {
    case "Good":
      return "bg-emerald-50 text-emerald-700"
    case "Moderate":
      return "bg-yellow-50 text-yellow-700"
    case "Poor":
      return "bg-orange-50 text-orange-700"
    case "Critical":
      return "bg-red-50 text-red-700"
  }
}

function confidenceLabel(confidence: number) {
  if (confidence >= 80) return { label: "High", tone: "bg-emerald-50 text-emerald-700" }
  if (confidence >= 70) return { label: "Medium", tone: "bg-amber-50 text-amber-700" }
  return { label: "Low", tone: "bg-orange-50 text-orange-700" }
}

export function DashboardContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawRiver = searchParams.get("river")
  const riverId = resolveRiverId(rawRiver)
  const rawRange = searchParams.get("range")
  const range = RANGE_OPTIONS.some((o) => o.value === rawRange) ? (rawRange as string) : "30d"
  const rangeDays = range === "7d" ? 7 : range === "90d" ? 90 : 30

  const selectedRiver = rivers.find((r) => r.id === riverId) ?? rivers[0]

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loadKey, setLoadKey] = useState(0)
  const [pollutionMetric, setPollutionMetric] = useState<"volume" | "incidents">("volume")

  const [zoneSearch, setZoneSearch] = useState("")
  const [zoneSeverityFilter, setZoneSeverityFilter] = useState<"all" | "Low" | "Moderate" | "High" | "Critical">("all")
  const [zoneRiskFilter, setZoneRiskFilter] = useState<"all" | "Low" | "Medium" | "High" | "Critical">("all")
  const [selectedZone, setSelectedZone] = useState<MonitoringZone | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 500)
    return () => clearTimeout(timer)
  }, [loadKey])

  const handleUpdateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, value)
      setIsLoading(true)
      setLoadKey((k) => k + 1)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdated(new Date())
      setShowToast(true)
    }, 600)
    setTimeout(() => setShowToast(false), 2400)
  }, [])

  const healthScore = useMemo(() => getRiverHealthScore(riverId), [riverId])
  const healthStatus = getHealthStatus(healthScore)
  const summary = useMemo(() => getRiverSummary(riverId), [riverId])
  const zones = useMemo(() => getZonesByRiverSelector(riverId), [riverId])
  const wqTrend = useMemo(() => getWaterQualityTrend(riverId, rangeDays), [riverId, rangeDays])
  const pollutionTrend = useMemo(() => getPollutionTrend(riverId, rangeDays), [riverId, rangeDays])
  const composition = useMemo(() => getWasteComposition(riverId), [riverId])
  const parameters = useMemo(() => getWaterParameterSummary(riverId), [riverId])
  const sources = useMemo(() => getPollutionSourceSummary(riverId), [riverId])

  const dominantRisk = useMemo(() => {
    if (zones.some((z) => z.riskLevel === "Critical")) return "Critical"
    if (zones.some((z) => z.riskLevel === "High")) return "High"
    if (zones.some((z) => z.riskLevel === "Medium")) return "Medium"
    if (zones.length) return "Low"
    return "N/A"
  }, [zones])

  const criticalZones = useMemo(() => zones.filter((z) => z.riskLevel === "Critical"), [zones])

  const recommendation = recommendations[0]
  const recommendationConfidence = confidenceLabel(
    recommendation ? recommendation.confidence : 0
  )

  const filteredZones = useMemo(() => {
    const term = zoneSearch.trim().toLowerCase()
    return zones.filter((zone) => {
      const matchesSearch =
        term.length === 0 ||
        zone.name.toLowerCase().includes(term) ||
        zone.primaryWaste.toLowerCase().includes(term)
      const matchesSeverity =
        zoneSeverityFilter === "all" || zoneSeverity(zone.pollutionLevel) === zoneSeverityFilter
      const matchesRisk = zoneRiskFilter === "all" || zone.riskLevel === zoneRiskFilter
      return matchesSearch && matchesSeverity && matchesRisk
    })
  }, [zones, zoneSearch, zoneSeverityFilter, zoneRiskFilter])

  const incidentTrend = useMemo(() => {
    const map = new Map<string, Record<string, number>>()
    wasteRecords
      .filter((w) => w.riverId === riverId)
      .forEach((w) => {
        const date = w.detectedAt.split("T")[0]
        const current = map.get(date) ?? { plastic: 0, sewage: 0, industrial: 0, organic: 0 }
        if (w.category === "Plastic") current.plastic += 1
        else if (w.category === "Sewage") current.sewage += 1
        else if (w.category === "Industrial") current.industrial += 1
        else if (w.category === "Organic") current.organic += 1
        map.set(date, current)
      })
    return [...map.entries()]
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [riverId])

  const treatmentByCategory = useMemo(() => {
    const map = new Map<string, string>()
    wasteRecords
      .filter((w) => w.riverId === riverId)
      .forEach((w) => {
        if (!map.has(w.category)) map.set(w.category, w.disposalRecommendation)
      })
    return map
  }, [riverId])

  const handleExportCsv = useCallback(() => {
    const rows = [
      ["Zone", "Water Quality", "Pollution Level", "Risk", "Primary Waste", "Last Inspection"],
      ...filteredZones.map((z) => [
        z.name,
        `${z.waterQualityScore}/100`,
        `${z.pollutionLevel}%`,
        z.riskLevel,
        z.primaryWaste,
        z.lastInspection,
      ]),
    ]
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `monitoring-zones-${riverShortName(riverId)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredZones, riverId])

  const riverItems = useMemo(() => {
    const items: Record<string, string> = {}
    rivers.forEach((r) => {
      items[r.name.toLowerCase()] = r.displayName
    })
    return items
  }, [])

  const rangeItems = useMemo(() => {
    const items: Record<string, string> = {}
    RANGE_OPTIONS.forEach((o) => {
      items[o.value] = o.label
    })
    return items
  }, [])

  return (
    <div className="min-h-full bg-slate-50">
      {showToast && (
        <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg shadow-emerald-100">
          <CircleCheck className="h-4 w-4" />
          Data refreshed — dashboard is up to date
        </div>
      )}

      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                River Health Dashboard
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Monitor water quality, pollution risk, waste accumulation and
              sanitation activity across monitored river zones.
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-teal-600" />
                {selectedRiver.displayName} · {selectedRiver.region}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                Last updated:{" "}
                {lastUpdated
                  ? lastUpdated.toLocaleString()
                  : "—"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Select
              value={riverShortName(riverId)}
              items={riverItems}
              onValueChange={(value) => handleUpdateParams("river", String(value))}
            >
              <SelectTrigger className="w-44" aria-label="Select river">
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

            <Select
              value={range}
              items={rangeItems}
              onValueChange={(value) => handleUpdateParams("range", String(value))}
            >
              <SelectTrigger className="w-40" aria-label="Select time range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </header>

        <div className="mt-6">
          <LiveSnapshotBanner />
        </div>

        {criticalZones.length > 0 && (
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <TriangleAlert className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Critical pollution detected — {criticalZones[0].name} — Water
                  Quality: {criticalZones[0].waterQualityScore}/100
                </p>
                <p className="mt-0.5 text-xs text-red-700">
                  Immediate intervention required. This zone is at critical risk.
                </p>
              </div>
            </div>
            <Link
              href={`/river-map?zone=${criticalZones[0].id}&river=${riverId}`}
              className={cn(buttonVariants({ variant: "default" }), "bg-red-600 text-white hover:bg-red-700 shrink-0")}
            >
              View Zone
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="mt-6">
            <DashboardSkeleton />
          </div>
        ) : (
          <>
            <section className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
              <Card className="p-6">
                <div className="flex flex-col items-center">
                  <HealthScore
                    score={healthScore}
                    label="River Health"
                    size="lg"
                    showTrend
                    trendValue={selectedRiver.description}
                  />
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Status: {healthStatus}
                  </p>
                  <Accordion className="mt-5 w-full">
                    <AccordionItem value="score">
                      <AccordionTrigger className="text-xs font-medium text-slate-600">
                        How is this score calculated?
                      </AccordionTrigger>
                      <AccordionContent className="text-xs leading-5 text-slate-600">
                        This is a prototype composite score built from average zone
                        water-quality index, dissolved oxygen, pH, turbidity,
                        pollution risk and accumulated waste burden. It is a
                        simplified indicator for demonstration purposes.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-3">
                <MetricCard
                  title="Water Quality Index"
                  value={summary.averageWQI}
                  unit="/100"
                  status="Moderate"
                  trend="up"
                  trendValue="+4.2%"
                  icon={<Activity className="h-4 w-4" />}
                  description="Average WQI across monitored zones"
                />
                <MetricCard
                  title="Dissolved Oxygen"
                  value={summary.averageDO}
                  unit="mg/L"
                  status={summary.averageDO >= 6 ? "Good" : summary.averageDO >= 4 ? "Moderate" : "Poor"}
                  trend="down"
                  trendValue="-0.3%"
                  icon={<GlassWater className="h-4 w-4" />}
                  description="Average dissolved oxygen levels"
                />
                <MetricCard
                  title="pH Level"
                  value={summary.averagePH}
                  status={summary.averagePH >= 6.5 && summary.averagePH <= 8.5 ? "Good" : "Moderate"}
                  trend="stable"
                  trendValue="Stable"
                  icon={<FlaskConical className="h-4 w-4" />}
                  description="Neutral to slightly alkaline range"
                />
                <MetricCard
                  title="Waste Detected"
                  value={summary.totalWaste}
                  unit="kg"
                  status="High"
                  trend="up"
                  trendValue="+8.1%"
                  icon={<Trash className="h-4 w-4" />}
                  description="Total waste detected in zones"
                />
                <MetricCard
                  title="Pollution Risk"
                  value={dominantRisk}
                  status={dominantRisk}
                  icon={<TriangleAlert className="h-4 w-4" />}
                  description={`${summary.highRiskZones} high/critical risk zone(s)`}
                />
                <MetricCard
                  title="Active Reports"
                  value={summary.activeReports}
                  status={summary.activeReports > 0 ? "Active" : "Clear"}
                  icon={<FileText className="h-4 w-4" />}
                  description="Open citizen & sensor reports"
                />
              </div>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-3">
              <ChartCard
                title="Water Quality Trend"
                description={`Average river WQI over the last ${rangeDays} days`}
                className="lg:col-span-2"
              >
                {wqTrend.length === 0 ? (
                  <EmptyState
                    icon={<Droplets className="h-5 w-5" />}
                    title="No water quality data"
                    description="Measurement data is only available for Musi River in this prototype."
                  />
                ) : (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={wqTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="wqGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                          minTickGap={28}
                        />
                        <YAxis
                          domain={[40, 90]}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                          width={36}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                            fontSize: 12,
                            boxShadow: "0 10px 30px -12px rgba(15,23,42,0.25)",
                          }}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name="WQI"
                          stroke="#0d9488"
                          strokeWidth={2}
                          fill="url(#wqGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ChartCard>

              <ChartCard title="Waste Composition" description="Click a segment for details">
                {composition.length === 0 ? (
                  <EmptyState
                    icon={<Trash className="h-5 w-5" />}
                    title="No waste data"
                    description="Waste records are only available for Musi River in this prototype."
                  />
                ) : (
                  <WasteCompositionChart
                    composition={composition}
                    treatmentByCategory={treatmentByCategory}
                  />
                )}
              </ChartCard>
            </section>

            <section className="mt-6">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Pollution Trend</CardTitle>
                      <CardDescription>
                        Waste accumulation by category over the selected period
                      </CardDescription>
                    </div>
                    <div className="inline-flex h-8 items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
                      {(["volume", "incidents"] as const).map((metric) => (
                        <button
                          key={metric}
                          type="button"
                          onClick={() => setPollutionMetric(metric)}
                          className={cn(
                            "h-full rounded-md px-3 text-xs font-medium capitalize transition-colors",
                            pollutionMetric === metric
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          {metric}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {pollutionTrend.length === 0 && pollutionMetric === "volume" ? (
                    <EmptyState
                      icon={<ChartColumn className="h-5 w-5" />}
                      title="No pollution trend"
                      description="Waste trend data is only available for Musi River in this prototype."
                    />
                  ) : (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={pollutionMetric === "volume" ? pollutionTrend : incidentTrend}
                          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                          barCategoryGap="30%"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={28}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                            label={{
                              value: pollutionMetric === "volume" ? "Weight (kg)" : "Incidents",
                              angle: -90,
                              position: "insideLeft",
                              style: { fontSize: 11, fill: "#64748b", textAnchor: "middle" },
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: "1px solid #e2e8f0",
                              fontSize: 12,
                              boxShadow: "0 10px 30px -12px rgba(15,23,42,0.25)",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="plastic" name="Plastic" stackId="a" fill="#0d9488" />
                          <Bar dataKey="sewage" name="Sewage" stackId="a" fill="#f59e0b" />
                          <Bar dataKey="industrial" name="Industrial" stackId="a" fill="#6366f1" />
                          <Bar dataKey="organic" name="Organic" stackId="a" fill="#22c55e" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Water Parameters</CardTitle>
                  <CardDescription>
                    Recent water chemistry across {selectedRiver.displayName} zones —
                    click a parameter for details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {parameters.length === 0 ? (
                    <EmptyState
                      icon={<FlaskConical className="h-5 w-5" />}
                      title="No parameter data"
                      description="Measurement data is only available for Musi River in this prototype."
                    />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                      {parameters.map((param) => (
                        <ParameterCard key={param.parameter} param={param} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex-row items-start justify-between gap-4 border-b">
                  <div>
                    <CardTitle>Monitoring Zones</CardTitle>
                    <CardDescription>
                      {filteredZones.length} zone(s) of {zones.length} for{" "}
                      {selectedRiver.displayName}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCsv}>
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search zone or waste type…"
                        value={zoneSearch}
                        onChange={(e) => setZoneSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select
                      value={zoneSeverityFilter}
                      onValueChange={(value) =>
                        setZoneSeverityFilter(value as "all" | "Low" | "Moderate" | "High" | "Critical")
                      }
                    >
                      <SelectTrigger className="w-36" aria-label="Filter by pollution severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["all", "Low", "Moderate", "High", "Critical"].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s === "all" ? "All severity" : `${s} level`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={zoneRiskFilter}
                      onValueChange={(value) =>
                        setZoneRiskFilter(value as "all" | "Low" | "Medium" | "High" | "Critical")
                      }
                    >
                      <SelectTrigger className="w-36" aria-label="Filter by risk level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["all", "Low", "Medium", "High", "Critical"].map((r) => (
                          <SelectItem key={r} value={r}>
                            {r === "all" ? "All risks" : `${r} risk`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredZones.length === 0 ? (
                    <EmptyState
                      icon={<Search className="h-5 w-5" />}
                      title="No zones match"
                      description="Try adjusting your search or filters."
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Zone</TableHead>
                          <TableHead>Water Quality</TableHead>
                          <TableHead>Pollution</TableHead>
                          <TableHead>Primary Waste</TableHead>
                          <TableHead>Risk</TableHead>
                          <TableHead>Last Inspection</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredZones.map((zone) => (
                          <TableRow key={zone.id}>
                            <TableCell className="font-medium">{zone.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium tabular-nums">{zone.waterQualityScore}</span>
                                <span className="text-xs text-slate-400">/100</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium", RISK_PILL[zoneSeverity(zone.pollutionLevel)])}>
                                {zone.pollutionLevel}%
                              </span>
                            </TableCell>
                            <TableCell className="text-slate-600">{zone.primaryWaste}</TableCell>
                            <TableCell>
                              <StatusBadge status={zone.riskLevel} variant="risk" />
                            </TableCell>
                            <TableCell className="text-slate-500">{zone.lastInspection}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedZone(zone)}
                              >
                                View
                              </Button>
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
                  <CardTitle>Pollution Sources</CardTitle>
                  <CardDescription>AI-identified risk contributors</CardDescription>
                </CardHeader>
                <CardContent>
                  {sources.length === 0 ? (
                    <EmptyState
                      icon={<Target className="h-5 w-5" />}
                      title="No source analysis"
                      description="Source analysis is only available for Musi River in this prototype."
                    />
                  ) : (
                    <div className="space-y-5">
                      {sources.map((source) => (
                        <div key={source.id}>
                          <ProgressPrimitive.Root
                            value={RISK_PERCENT[source.risk] ?? 50}
                            className="flex flex-wrap gap-3"
                          >
                            <ProgressPrimitive.Label className="text-sm font-medium">
                              {source.source}
                            </ProgressPrimitive.Label>
                            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                              {source.incidentCount} incident{source.incidentCount === 1 ? "" : "s"}
                            </span>
                            <ProgressPrimitive.Track className="relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted">
                              <ProgressPrimitive.Indicator
                                className={cn(
                                  "h-full transition-all",
                                  RISK_BAR_COLOR[source.risk] ?? "bg-slate-500"
                                )}
                              />
                            </ProgressPrimitive.Track>
                          </ProgressPrimitive.Root>
                          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={source.risk} variant="risk" />
                              <span>Confidence {source.confidence}%</span>
                            </div>
                            <TrendIndicator
                              value={source.trend === "up" ? "Rising" : source.trend === "down" ? "Falling" : "Stable"}
                              direction={source.trend}
                              isPositive={source.trend === "down"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="mt-6">
              <Card className="border-teal-100 bg-gradient-to-br from-white to-teal-50/50">
                <CardHeader className="border-b border-teal-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <CardTitle>AI Recommendation</CardTitle>
                      <CardDescription>
                        Prioritized action generated from detected signals
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {recommendation ? (
                  <CardContent className="pt-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-[#0c1e3a]">
                            {recommendation.title}
                          </h3>
                          <Badge className={recommendationConfidence.tone}>
                            {recommendationConfidence.label} confidence
                          </Badge>
                          <StatusBadge status={recommendation.priority} variant="priority" />
                        </div>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                          {recommendation.summary}
                        </p>
                        <div className="mt-4">
                          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Reasoning signals
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {recommendation.signals.map((signal) => (
                              <span
                                key={signal}
                                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                              >
                                <CircleCheck className="h-3 w-3 text-teal-600" />
                                {signal.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                        <Link
                          href="/action-center"
                          className={cn(buttonVariants({ variant: "default", size: "default" }), "bg-teal-600 text-white hover:bg-teal-700 gap-2")}
                        >
                          <ListChecks className="h-4 w-4" />
                          Create Action
                        </Link>
                        <RecommendationDialog recommendation={recommendation} />
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent>
                    <EmptyState
                      icon={<Sparkles className="h-5 w-5" />}
                      title="No recommendations"
                      description="No AI recommendations are available for this river."
                    />
                  </CardContent>
                )}
              </Card>
            </section>
          </>
        )}
      </div>

      <ZoneSheet
        zone={selectedZone}
        riverId={riverId}
        onOpenChange={(open) => {
          if (!open) setSelectedZone(null)
        }}
      />
    </div>
  )
}

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function WasteCompositionChart({
  composition,
  treatmentByCategory,
}: {
  composition: { category: WasteCategory; weightKg: number; percentage: number }[]
  treatmentByCategory: Map<string, string>
}) {
  const [activeCategory, setActiveCategory] = useState<WasteCategory | null>(null)
  const activeItem = composition.find((c) => c.category === activeCategory) ?? null

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={composition}
              dataKey="weightKg"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={86}
              paddingAngle={2}
              strokeWidth={1}
              onClick={(entry) => {
                const payload = entry as unknown as { payload?: { category: WasteCategory } }
                if (payload?.payload?.category) {
                  setActiveCategory(payload.payload.category)
                }
              }}
            >
              {composition.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category] ?? "#64748b"}
                  opacity={activeCategory && activeCategory !== entry.category ? 0.35 : 1}
                />
              ))}
            </Pie>
            <Tooltip content={<CompositionTooltip treatmentByCategory={treatmentByCategory} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#0c1e3a]">
            {composition.reduce((s, c) => s + c.weightKg, 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">kg detected</span>
        </div>
      </div>

      <div className="mt-3 w-full space-y-1.5">
        {composition.map((item) => (
          <button
            key={item.category}
            type="button"
            onClick={() => setActiveCategory(item.category)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors",
              activeCategory === item.category
                ? "border-teal-200 bg-teal-50"
                : "border-transparent hover:bg-slate-50"
            )}
          >
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? "#64748b" }}
              />
              {item.category}
            </span>
            <span className="font-semibold text-slate-500 tabular-nums">
              {item.weightKg} kg · {item.percentage}%
            </span>
          </button>
        ))}
      </div>

      {activeItem && (
        <div className="mt-3 w-full rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-xs">
          <p className="font-semibold text-teal-800">
            {activeItem.category} — {activeItem.weightKg} kg ({activeItem.percentage}%)
          </p>
          <p className="mt-1 text-teal-700">
            Recommended treatment:{" "}
            {treatmentByCategory.get(activeItem.category) ?? "Segregation & processing"}
          </p>
        </div>
      )}
    </div>
  )
}

function CompositionTooltip({
  active,
  payload,
  treatmentByCategory,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; payload?: { category: WasteCategory; percentage: number } }>
  treatmentByCategory: Map<string, string>
}) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0]
  const category = data.name ?? data.payload?.category
  if (!category) return null
  const item = data.payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-800">{category}</p>
      <p className="mt-0.5 text-slate-500">
        Weight: {data.value?.toLocaleString()} kg {item ? `· ${item.percentage}%` : ""}
      </p>
      <p className="mt-0.5 text-slate-500">
        Treatment: {treatmentByCategory.get(category) ?? "Segregation & processing"}
      </p>
    </div>
  )
}

function ParameterCard({ param }: { param: WaterParameterSummary }) {
  const [open, setOpen] = useState(false)
  const range = PARAMETER_RANGES[param.parameter] ?? "Prototype reference range"

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <button
              type="button"
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            />
          }
        >
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {param.parameter}
            </p>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", parameterStatusClasses(param.status))}>
              {param.status}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#0c1e3a] tabular-nums">
              {param.value}
            </span>
            {param.unit && (
              <span className="text-xs font-medium text-slate-400">{param.unit}</span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Reference: {range}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-teal-600 opacity-0 transition-opacity group-hover:opacity-100">
            View details
            <ArrowRight className="h-3 w-3" />
          </p>
        </DialogTrigger>
        <ParameterDialog param={param} />
      </Dialog>
    </>
  )
}

function ParameterDialog({ param }: { param: WaterParameterSummary }) {
  return (
    <>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{param.parameter}</DialogTitle>
          <DialogDescription>
            Water chemistry detail for {param.parameter.replace(/_/g, " ")}
          </DialogDescription>
        </DialogHeader>
        <ParameterDetails param={param} />
        <DialogFooter showCloseButton>
          <Button variant="outline" render={<Link href="/river-map" />}>
            Open Map
          </Button>
        </DialogFooter>
      </DialogContent>
    </>
  )
}

function ParameterDetails({ param }: { param: WaterParameterSummary }) {
  const measurements = getMeasurementsByRiver("river-musi", 30)
  const field = PARAMETER_FIELDS[param.parameter]
  const values = measurements
    .map((m) => m[field as keyof WaterMeasurementLike])
    .filter((v): v is number => typeof v === "number")

  const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const first = values[0]
  const last = values[values.length - 1]
  const change = first && last ? ((last - first) / first) * 100 : 0
  const range = PARAMETER_RANGES[param.parameter] ?? "Prototype reference range"

  const interpretation =
    param.status === "Good"
      ? "Within the desirable reference range for healthy river water."
      : param.status === "Moderate"
        ? "Within acceptable limits — continued monitoring recommended."
        : "Exceeds acceptable limits — further investigation and remediation required."

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Current value</p>
          <p className="mt-0.5 text-xl font-bold text-[#0c1e3a] tabular-nums">
            {param.value}
            {param.unit && <span className="ml-1 text-xs font-medium text-slate-400">{param.unit}</span>}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Status</p>
          <p className="mt-1">
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", parameterStatusClasses(param.status))}>
              {param.status}
            </span>
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Reference range</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-700">{range}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">30-day trend</p>
          <p className="mt-1">
            <TrendIndicator
              value={Math.abs(change).toFixed(1) + "%"}
              direction={param.trend}
              isPositive={
                param.parameter === "Turbidity" || param.parameter === "BOD" || param.parameter === "COD"
                  ? param.trend === "down"
                  : param.trend === "up"
              }
            />
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 p-3">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Summary statistics (30 days)
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-slate-50 py-2">
            <p className="text-sm font-bold text-slate-700 tabular-nums">{avg.toFixed(2)}</p>
            <p className="text-[11px] text-slate-500">Average</p>
          </div>
          <div className="rounded-lg bg-slate-50 py-2">
            <p className="text-sm font-bold text-slate-700 tabular-nums">{min.toFixed(2)}</p>
            <p className="text-[11px] text-slate-500">Min</p>
          </div>
          <div className="rounded-lg bg-slate-50 py-2">
            <p className="text-sm font-bold text-slate-700 tabular-nums">{max.toFixed(2)}</p>
            <p className="text-[11px] text-slate-500">Max</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 p-3">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Interpretation</p>
        <p className="mt-1.5 text-sm leading-6 text-slate-600">{interpretation}</p>
      </div>
    </div>
  )
}

function ZoneSheet({
  zone,
  riverId,
  onOpenChange,
}: {
  zone: MonitoringZone | null
  riverId: string
  onOpenChange: (open: boolean) => void
}) {
  const [historyZoneId, setHistoryZoneId] = useState<string | null>(null)
  const river = rivers.find((r) => r.id === riverId)
  const showHistory = zone ? historyZoneId === zone.id : false

  const history = useMemo(() => {
    if (!zone) return []
    const waste = getWasteByZone(zone.id).map((w) => ({
      id: `w-${w.id}`,
      date: w.detectedAt,
      title: `${w.weightKg} kg of ${w.category.toLowerCase()} detected`,
      meta: `Recommendation: ${w.disposalRecommendation}`,
      tone: "waste" as const,
    }))
    const anomaliesForZone = getAnomaliesByZone(zone.id).map((a) => ({
      id: `a-${a.id}`,
      date: a.detectedAt,
      title: `${a.severity} anomaly — ${a.metric}`,
      meta: `Observed ${a.observedValue} vs expected ${a.expectedValue}`,
      tone: "anomaly" as const,
    }))
    const inspection = {
      id: "inspection",
      date: zone.lastInspection,
      title: "Zone inspection completed",
      meta: zone.recommendedAction,
      tone: "inspection" as const,
    }
    return [...waste, ...anomaliesForZone, inspection].sort((a, b) =>
      b.date.localeCompare(a.date)
    )
  }, [zone])

  return (
    <Sheet open={!!zone} onOpenChange={onOpenChange}>
      <SheetContent showCloseButton>
        <SheetHeader>
          <SheetTitle>{zone?.name}</SheetTitle>
          <SheetDescription>
            {river?.displayName} · {zone?.latitude.toFixed(3)}, {zone?.longitude.toFixed(3)}
          </SheetDescription>
        </SheetHeader>

        {zone && (
          <div className="space-y-4 px-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Water Quality</p>
                <p className="mt-0.5 text-xl font-bold text-[#0c1e3a] tabular-nums">
                  {zone.waterQualityScore}
                  <span className="text-xs font-medium text-slate-400">/100</span>
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Pollution Level</p>
                <p className="mt-0.5 text-xl font-bold text-[#0c1e3a] tabular-nums">
                  {zone.pollutionLevel}
                  <span className="text-xs font-medium text-slate-400">%</span>
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Risk Level</p>
                <p className="mt-1">
                  <StatusBadge status={zone.riskLevel} variant="risk" />
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Severity</p>
                <p className="mt-1">
                  <StatusBadge status={zoneSeverity(zone.pollutionLevel)} variant="severity" />
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Primary waste
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">{zone.primaryWaste}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Last inspection
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">{zone.lastInspection}</p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
              <p className="text-xs font-semibold tracking-wide text-teal-700 uppercase">
                Recommended action
              </p>
              <p className="mt-1 text-sm font-medium text-teal-800">
                {zone.recommendedAction}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/river-map?zone=${zone.id}&river=${riverId}`}
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "bg-teal-600 text-white hover:bg-teal-700"
                )}
              >
                <MapPin className="h-4 w-4" />
                Open on Map
              </Link>
              <Button
                variant="outline"
                onClick={() => setHistoryZoneId((v) => (v === zone.id ? null : zone.id))}
              >
                <Clock3 className="h-4 w-4" />
                {showHistory ? "Hide History" : "View History"}
              </Button>
            </div>

            {showHistory && (
              <div className="rounded-xl border border-slate-200">
                <div className="border-b px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Recent events
                </div>
                <ScrollArea className="max-h-60">
                  <div className="space-y-0 p-3">
                    {history.map((event, index) => (
                      <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                        {index < history.length - 1 && (
                          <span className="absolute top-3 left-[5px] h-full w-px bg-slate-200" />
                        )}
                        <span
                          className={cn(
                            "relative mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                            event.tone === "anomaly"
                              ? "bg-red-400"
                              : event.tone === "waste"
                                ? "bg-amber-400"
                                : "bg-teal-400"
                          )}
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{event.title}</p>
                          <p className="text-[11px] text-slate-500">{event.meta}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {new Date(event.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        <SheetFooter>
          <Button variant="outline" render={<Link href="/report-pollution" />}>
            <Flag className="h-4 w-4" />
            Report Issue
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function RecommendationDialog({
  recommendation,
}: {
  recommendation: (typeof recommendations)[number]
}) {
  const confidence = confidenceLabel(recommendation.confidence)
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" className="gap-2" />}
      >
        <Target className="h-4 w-4" />
        View Recommendation
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{recommendation.title}</DialogTitle>
          <DialogDescription>
            AI-generated ({recommendation.type}) · Confidence {recommendation.confidence}%
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={confidence.tone}>{confidence.label} confidence</Badge>
            <StatusBadge status={recommendation.priority} variant="priority" />
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            {recommendation.summary}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Reasoning signals
            </p>
            <ul className="mt-2 space-y-1.5">
              {recommendation.signals.map((signal) => (
                <li key={signal} className="flex items-center gap-2 text-sm text-slate-600">
                  <CircleCheck className="h-4 w-4 shrink-0 text-teal-600" />
                  {signal.replace(/_/g, " ")}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
            <p className="text-xs font-semibold tracking-wide text-teal-700 uppercase">
              Recommended actions
            </p>
            <p className="mt-1 text-sm text-teal-800">
              Dispatch a {recommendation.type.toLowerCase()} crew to the zone, log follow-up
              checks and notify the assigned authority via the action center.
            </p>
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button variant="outline" render={<Link href="/action-center" />}>
            <ListChecks className="h-4 w-4" />
            Go to Action Center
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}