"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  MapPin,
  Activity,
  Shield,
  Eye,
  BarChart3,
  Info,
  ArrowRight,
  FlaskConical,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DemoBadge } from "@/components/shared/demo-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { MetricCard } from "@/components/shared/metric-card";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { rivers } from "@/lib/demo-data/rivers";
import { anomalies } from "@/lib/demo-data/analytics";
import {
  getPollutionSourceSummary,
  getZonesByRiverSelector,
} from "@/lib/selectors";
import type { PollutionSource } from "@/lib/types";

interface TrendDataPoint {
  day: string;
  value: number;
}

function generateTrendData(sourceId: string): TrendDataPoint[] {
  const baseValues: Record<string, number[]> = {
    "src-001": [42, 45, 48, 44, 50, 55, 52, 58, 60, 62, 58, 64, 68, 72, 70, 74, 78, 76, 80, 82, 85, 88, 84, 90, 92, 88, 94, 96, 92, 98],
    "src-002": [35, 36, 38, 37, 39, 40, 38, 41, 42, 40, 43, 44, 42, 45, 46, 44, 47, 48, 46, 49, 50, 48, 51, 52, 50, 53, 54, 52, 55, 56],
    "src-003": [28, 26, 24, 25, 23, 22, 24, 21, 20, 22, 19, 18, 20, 17, 16, 18, 15, 14, 16, 13, 12, 14, 11, 10, 12, 9, 8, 10, 7, 6],
    "src-004": [15, 16, 15, 17, 16, 18, 17, 16, 18, 17, 19, 18, 17, 19, 18, 20, 19, 18, 20, 19, 21, 20, 19, 21, 20, 22, 21, 20, 22, 21],
    "src-005": [38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96],
  };

  const values = baseValues[sourceId] ?? baseValues["src-001"];
  return values.map((v, i) => ({
    day: `Day ${i + 1}`,
    value: v,
  }));
}

function getAllSourcesTrendData(): TrendDataPoint[] {
  const days = 30;
  return Array.from({ length: days }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.round(
      ((generateTrendData("src-001")[i]?.value ?? 50) +
        (generateTrendData("src-002")[i]?.value ?? 40) +
        (generateTrendData("src-003")[i]?.value ?? 20) +
        (generateTrendData("src-004")[i]?.value ?? 18) +
        (generateTrendData("src-005")[i]?.value ?? 60)) /
        5
    ),
  }));
}

const INSIGHTS = [
  { text: "Zone 04 shows persistent plastic accumulation above seasonal baseline", zoneId: "zone-musi-04" },
  { text: "Domestic sewage indicators rising near Zone 06 and Zone 08", zoneId: "zone-musi-06" },
  { text: "Industrial discharge concentration decreasing at Zone 07 after recent intervention", zoneId: "zone-musi-07" },
  { text: "Agricultural runoff patterns consistent with expected seasonal variation in Zone 11", zoneId: "zone-musi-11" },
  { text: "Solid waste accumulation rate accelerating at Zone 05", zoneId: "zone-musi-05" },
  { text: "Water quality index improvement observed at Zone 01 following upstream cleanup", zoneId: "zone-musi-01" },
];

const CORRELATIONS = [
  { title: "Plastic dumping ↔ waste accumulation", description: "Areas with high plastic dumping rates show associated increase in total waste volume. This pattern is consistent across multiple monitoring zones.", confidence: 82 },
  { title: "Domestic sewage ↔ dissolved oxygen decline", description: "Zones with elevated domestic sewage indicators show associated decline in dissolved oxygen levels. This relationship is commonly observed in affected water bodies.", confidence: 76 },
  { title: "Industrial discharge ↔ COD increase", description: "Proximity to industrial discharge points is associated with higher chemical oxygen demand readings. This pattern suggests possible industrial influence.", confidence: 69 },
];

function TrendIcon({ direction }: { direction: string }) {
  if (direction === "up") return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (direction === "down") return <TrendingDown className="h-4 w-4 text-green-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function PollutionAnalysisContent() {
  const searchParams = useSearchParams();
  const riverParam = searchParams.get("river") ?? "river-musi";

  const [selectedRiver, setSelectedRiver] = useState(riverParam);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [sourceDialogSource, setSourceDialogSource] = useState<PollutionSource | null>(null);
  const [zonesSource, setZonesSource] = useState<string>("all");

  const zones = useMemo(() => getZonesByRiverSelector(selectedRiver), [selectedRiver]);
  const sources = useMemo(() => getPollutionSourceSummary(selectedRiver), [selectedRiver]);

  const highestRiskSource = useMemo(() => {
    const riskOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return [...sources].sort(
      (a, b) => (riskOrder[b.risk] ?? 0) - (riskOrder[a.risk] ?? 0)
    )[0];
  }, [sources]);

  const topAffectedZone = useMemo(() => {
    const zoneIdCounts = new Map<string, number>();
    sources.forEach((s) =>
      s.affectedZones.forEach((zid) => {
        zoneIdCounts.set(zid, (zoneIdCounts.get(zid) ?? 0) + 1);
      })
    );
    let topZoneId = "";
    let topCount = 0;
    zoneIdCounts.forEach((count, id) => {
      if (count > topCount) {
        topCount = count;
        topZoneId = id;
      }
    });
    return zones.find((z) => z.id === topZoneId);
  }, [sources, zones]);

  const activeIncidents = useMemo(
    () => sources.reduce((sum, s) => sum + s.incidentCount, 0),
    [sources]
  );

  const unresolvedHighRisk = useMemo(
    () => sources.filter((s) => s.risk === "High" || s.risk === "Critical").length,
    [sources]
  );

  const trendData = useMemo(() => {
    if (selectedSource === "all") return getAllSourcesTrendData();
    return generateTrendData(selectedSource);
  }, [selectedSource]);

  const zonesSourceSource = useMemo(
    () => sources.find((s) => s.id === zonesSource) ?? null,
    [sources, zonesSource]
  );

  const affectedZonesForSource = useMemo(() => {
    if (!zonesSourceSource) return [];
    return zones.filter((z) => zonesSourceSource.affectedZones.includes(z.id));
  }, [zonesSourceSource, zones]);

  const getZoneName = (zoneId: string) => {
    return zones.find((z) => z.id === zoneId)?.name ?? zoneId;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Pollution Source Analysis
          </h1>
          <DemoBadge />
          <Badge variant="secondary" className="gap-1">
            <FlaskConical className="h-3 w-3" />
            Prototype analysis
          </Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Identify where pollution originates and understand driving factors across monitored river zones.
        </p>
      </div>

      {/* River Selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedRiver} onValueChange={(v) => { setSelectedRiver(v ?? "river-musi"); setSelectedSource("all"); }}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select river" />
          </SelectTrigger>
          <SelectContent>
            {rivers.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Top KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Highest Risk Source"
          value={highestRiskSource?.source ?? "N/A"}
          status={highestRiskSource?.risk}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          title="Top Affected Zone"
          value={topAffectedZone?.name ?? "N/A"}
          icon={<MapPin className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Source Incidents"
          value={activeIncidents}
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          title="Unresolved High-Risk"
          value={unresolvedHighRisk}
          icon={<Shield className="h-4 w-4" />}
        />
      </div>

      {/* Source List */}
      <div className="space-y-4">
        <SectionHeader
          title="Pollution Sources"
          description="Identified pollution sources affecting monitored zones"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {sources.map((source) => (
            <Card key={source.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{source.source}</CardTitle>
                  <div className="flex items-center gap-2">
                    <TrendIcon direction={source.trend} />
                    <StatusBadge status={source.risk} variant="risk" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Confidence</span>
                    <p className="font-medium">{source.confidence}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Incidents</span>
                    <p className="font-medium">{source.incidentCount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Zones</span>
                    <p className="font-medium">{source.affectedZones.length}</p>
                  </div>
                </div>
                <Progress value={source.confidence} />
                <Dialog
                  open={sourceDialogSource?.id === source.id}
                  onOpenChange={(open) => {
                    if (!open) setSourceDialogSource(null);
                  }}
                >
                  <DialogTrigger
                    render={
                      <Button variant="outline" size="sm" className="w-full gap-1.5" />
                    }
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{source.source}</DialogTitle>
                      <DialogDescription>
                        Detailed assessment for this pollution source
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={source.risk} variant="risk" />
                        <span className="text-sm text-muted-foreground">
                          {source.confidence}% confidence
                        </span>
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium">Evidence</h4>
                        <p className="text-sm text-muted-foreground">{source.evidence}</p>
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium">Affected Zones</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {source.affectedZones.map((zid) => (
                            <Badge key={zid} variant="secondary" className="text-xs">
                              {getZoneName(zid)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium">Recommended Next Steps</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
                            Increase monitoring frequency in affected zones
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
                            Conduct source-specific investigation
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
                            Coordinate with relevant authorities
                          </li>
                        </ul>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link href={`/river-map?source=${source.id}&river=${selectedRiver}`} />
                        }
                      >
                        View affected zones
                      </Button>
                      <Button
                        size="sm"
                        render={<Link href="/action-center" />}
                      >
                        Create Action
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Source Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Source Trends (30 Days)
            </CardTitle>
            <Select value={selectedSource} onValueChange={(v) => setSelectedSource(v ?? "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name="Incident Index"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Affected Zones Table */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-sm">Affected Zones by Source</CardTitle>
            <Select value={zonesSource} onValueChange={(v) => setZonesSource(v ?? "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {zonesSource !== "all" && zonesSourceSource && affectedZonesForSource.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Zone</th>
                    <th className="pb-2 font-medium">Risk</th>
                    <th className="pb-2 font-medium">WQI</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {affectedZonesForSource.map((zone) => (
                    <tr key={zone.id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{zone.name}</td>
                      <td className="py-2.5">
                        <StatusBadge status={zone.riskLevel} variant="risk" />
                      </td>
                      <td className="py-2.5">{zone.waterQualityScore}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className="text-xs">
                          {zone.riskLevel === "High" || zone.riskLevel === "Critical"
                            ? "Needs attention"
                            : "Monitoring"}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          render={
                            <Link href={`/river-map?river=${selectedRiver}&zone=${zone.id}`} />
                          }
                        >
                          <MapPin className="mr-1 h-3 w-3" />
                          View on Map
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Select a pollution source above to see its affected zones and water quality context.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <div className="space-y-4">
        <SectionHeader
          title="Anomaly Detection"
          description="Automatically detected deviations from expected patterns"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {anomalies.map((anomaly) => {
            const zone = zones.find((z) => z.id === anomaly.entityId);
            return (
              <Card key={anomaly.id}>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{anomaly.metric}</p>
                      <p className="text-xs text-muted-foreground">
                        {zone?.name ?? anomaly.entityId}
                      </p>
                    </div>
                    <StatusBadge status={anomaly.severity} variant="severity" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Observed</span>
                      <p className="font-medium">{anomaly.observedValue}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected</span>
                      <p className="font-medium">{anomaly.expectedValue}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deviation</span>
                      <p className="font-medium">{anomaly.deviation}x</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Detected</span>
                      <p className="font-medium">
                        {new Date(anomaly.detectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    Prototype anomaly detection
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" render={<Link href={`/river-map?river=${selectedRiver}&zone=${anomaly.entityId}`} />}>
                      View Zone
                    </Button>
                    <Button variant="ghost" size="sm" render={<Link href={`/river-map?river=${selectedRiver}`} />}>
                      Open Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Insight Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Insight Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {INSIGHTS.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border px-4 py-3"
              >
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="text-sm">{insight.text}</p>
                </div>
                <Button variant="ghost" size="sm" render={<Link href={`/river-map?river=${selectedRiver}&zone=${insight.zoneId}`} />}>
                  <MapPin className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Correlation Panel */}
      <div className="space-y-4">
        <SectionHeader
          title="Correlation Analysis"
          description="Observed associations between pollution indicators (not causal attribution)"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORRELATIONS.map((corr, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-4">
                <p className="text-sm font-medium">{corr.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {corr.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <Progress value={corr.confidence} className="flex-1" />
                  <span className="text-xs font-medium">{corr.confidence}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Note */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Source assessments are based on available demonstration indicators and should not be
              interpreted as verified attribution. Results are generated from simulated data for
              prototype demonstration purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PollutionAnalysisPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="Loading analysis..."
              description="Preparing pollution source data."
            />
          </div>
        }
      >
        <PollutionAnalysisContent />
      </Suspense>
    </div>
  );
}
