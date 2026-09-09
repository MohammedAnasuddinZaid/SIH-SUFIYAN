"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import {
  ScanLine,
  Layers,
  Truck,
  Factory,
  Recycle,
  BadgeCheck,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DemoBadge } from "@/components/shared/demo-badge";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionHeader } from "@/components/shared/section-header";
import { wasteRecords } from "@/lib/demo-data/waste";
import { actions } from "@/lib/demo-data/actions";
import { rivers } from "@/lib/demo-data/rivers";
import { getZoneById } from "@/lib/demo-data/monitoring-zones";
import { calculateWasteMetrics } from "@/lib/impact-utils";
import type { WasteCategory } from "@/lib/types";

const PIPELINE_STAGES = [
  {
    key: "detection",
    label: "Detection",
    icon: ScanLine,
    description: "AI-powered waste identification from imagery",
  },
  {
    key: "segregation",
    label: "Segregation",
    icon: Layers,
    description: "Category-based waste classification",
  },
  {
    key: "collection",
    label: "Collection",
    icon: Search,
    description: "Physical waste removal from waterbody",
  },
  {
    key: "transportation",
    label: "Transport",
    icon: Truck,
    description: "Transfer to authorized facilities",
  },
  {
    key: "treatment",
    label: "Treatment",
    icon: Factory,
    description: "Processing at treatment facilities",
  },
  {
    key: "verification",
    label: "Verification",
    icon: BadgeCheck,
    description: "Post-treatment compliance check",
  },
] as const;

type PipelineStageKey = (typeof PIPELINE_STAGES)[number]["key"];

const CATEGORIES: WasteCategory[] = [
  "Plastic",
  "Organic",
  "Industrial",
  "Sewage",
  "Mixed",
  "Metal",
  "Glass",
  "Electronic",
];

const STAGE_OPTIONS = [
  "Detection",
  "Segregation",
  "Collection",
  "Transportation",
  "Treatment",
  "Verification",
];

function getActionForZone(zoneId: string) {
  return actions.find((a) => a.zoneId === zoneId);
}

function actionStatusToStage(
  status: string | undefined
): PipelineStageKey {
  if (!status) return "detection";
  if (status === "planned") return "segregation";
  if (status === "assigned") return "collection";
  if (status === "in_progress") return "transportation";
  if (status === "completed") return "treatment";
  if (status === "awaiting_verification") return "verification";
  return "detection";
}

function stageIndex(key: PipelineStageKey): number {
  return PIPELINE_STAGES.findIndex((s) => s.key === key);
}

function getJobId(index: number): string {
  return `WJ-2026-${String(index + 1).padStart(5, "0")}`;
}

function getStatusLabel(status: string | undefined): string {
  if (!status) return "Pending";
  switch (status) {
    case "planned":
      return "Planned";
    case "assigned":
      return "Assigned";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "awaiting_verification":
      return "Awaiting Verification";
    default:
      return status;
  }
}

function getStageStatus(
  stageKey: PipelineStageKey,
  currentStageKey: PipelineStageKey
): "completed" | "active" | "pending" {
  const sIdx = stageIndex(stageKey);
  const cIdx = stageIndex(currentStageKey);
  if (sIdx < cIdx) return "completed";
  if (sIdx === cIdx) return "active";
  return "pending";
}

function buildFlowData(metrics: ReturnType<typeof calculateWasteMetrics>) {
  return [
    { stage: "Detected", kg: metrics.detected },
    { stage: "Collected", kg: metrics.collected },
    { stage: "Transported", kg: metrics.transported },
    { stage: "Treated", kg: metrics.treated },
  ];
}

function WasteJobDetailDialog({
  job,
  open,
  onOpenChange,
}: {
  job: ReturnType<typeof buildJobs>[number];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const collectedApprox = Math.round(job.record.weightKg * 0.72);
  const currentStageKey = actionStatusToStage(job.action?.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{job.jobId}</DialogTitle>
          <DialogDescription>
            {job.category} waste from {job.zoneName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Category:</span>{" "}
              <span className="font-medium">{job.category}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Quantity:</span>{" "}
              <span className="font-medium">{job.record.weightKg} kg</span>
            </div>
            <div>
              <span className="text-muted-foreground">Detected:</span>{" "}
              <span className="font-medium">
                {new Date(job.record.detectedAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Confidence:</span>{" "}
              <span className="font-medium">
                {job.record.confidence}%
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium">Pipeline Progress</h4>
            <div className="space-y-1.5">
              {PIPELINE_STAGES.map((stage) => {
                const ss = getStageStatus(stage.key, currentStageKey);
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.key}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        ss === "completed"
                          ? "text-green-600"
                          : ss === "active"
                            ? "text-blue-600"
                            : "text-muted-foreground/40"
                      }`}
                    />
                    <span
                      className={
                        ss === "completed"
                          ? "text-green-700"
                          : ss === "active"
                            ? "font-medium text-blue-700"
                            : "text-muted-foreground"
                      }
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Estimated vs Collected:</strong> Detected {job.record.weightKg} kg, estimated collected ~{collectedApprox} kg (72% prototype estimate). Actual collection volumes may differ from AI detection estimates.
            </p>
          </div>

          {job.action && (
            <div className="space-y-1 text-sm">
              <h4 className="font-medium">Assigned Action</h4>
              <p className="text-muted-foreground">{job.action.title}</p>
              <p className="text-xs text-muted-foreground">
                Team: {job.action.assignedTeam} · Due: {job.action.dueDate}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="rounded-lg border p-2">
              <p className="font-medium text-foreground">Facility (demo)</p>
              <p>{job.record.disposalRecommendation}</p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="font-medium text-foreground">Vehicle (demo)</p>
              <p>TRK-{String(job.index + 1).padStart(3, "0")} · Available</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button render={<Link href={`/waste-management/${job.jobId}`} />}>
            View Full Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildJobs(categoryFilter: string, stageFilter: string, riverFilter: string) {
  return wasteRecords
    .map((record, index) => {
      const zone = getZoneById(record.zoneId);
      const action = getActionForZone(record.zoneId);
      const currentStageKey = actionStatusToStage(action?.status);
      const currentStageLabel =
        PIPELINE_STAGES.find((s) => s.key === currentStageKey)?.label ??
        "Detection";
      return {
        index,
        jobId: getJobId(index),
        record,
        zoneName: zone?.name ?? record.zoneId,
        zoneId: record.zoneId,
        riverId: record.riverId,
        category: record.category,
        quantity: record.weightKg,
        currentStageKey,
        currentStageLabel,
        assignedTeam: action?.assignedTeam ?? "Unassigned",
        status: getStatusLabel(action?.status),
        action,
      };
    })
    .filter(
      (job) =>
        (!categoryFilter || job.category === categoryFilter) &&
        (!stageFilter || job.currentStageLabel === stageFilter) &&
        (!riverFilter || job.riverId === riverFilter)
    );
}

function WasteManagementInner() {
  const metrics = calculateWasteMetrics();
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [riverFilter, setRiverFilter] = useState<string>("");
  const [dialogJob, setDialogJob] = useState<ReturnType<typeof buildJobs>[number] | null>(null);

  const jobs = buildJobs(categoryFilter, stageFilter, riverFilter);
  const flowData = buildFlowData(metrics);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Waste Management"
        description="Track waste from detection through segregation, collection, transport, treatment and verification."
        action={<DemoBadge />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Waste Detected"
          value={metrics.detected.toLocaleString()}
          unit="kg"
          icon={<ScanLine className="h-4 w-4" />}
          description="Total waste identified by AI detection"
        />
        <MetricCard
          title="Waste Collected"
          value={metrics.collected.toLocaleString()}
          unit="kg"
          icon={<Layers className="h-4 w-4" />}
          description="Estimated (72% of detected)"
        />
        <MetricCard
          title="In Transit"
          value={metrics.inTransit}
          unit="jobs"
          icon={<Truck className="h-4 w-4" />}
          description="Currently being transported"
        />
        <MetricCard
          title="Treated/Disposed"
          value={Math.round((metrics.treated / metrics.detected) * 100)}
          unit="%"
          icon={<Recycle className="h-4 w-4" />}
          description={`${metrics.treated.toLocaleString()} kg treated`}
        />
        <MetricCard
          title="Awaiting Verification"
          value={metrics.verified}
          unit="jobs"
          icon={<BadgeCheck className="h-4 w-4" />}
          description="Pending final verification"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Prototype estimates from demo operational data
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Waste Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {PIPELINE_STAGES.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-center text-xs font-medium leading-tight">
                      {stage.label}
                    </span>
                    <span className="hidden text-center text-[10px] text-muted-foreground lg:block">
                      {stage.description}
                    </span>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className="mx-1 hidden h-px w-8 bg-border md:block" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto md:hidden">
            {PIPELINE_STAGES.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="whitespace-nowrap text-xs font-medium">
                      {stage.label}
                    </span>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className="mx-2 h-px w-4 bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Waste Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={flowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [
                  `${Number(value ?? 0).toLocaleString()} kg`,
                  "Weight",
                ]}
              />
              <Bar dataKey="kg" fill="oklch(0.6 0.15 260)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-muted-foreground">
            Prototype demonstration data — estimated flow from detection to treatment
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "")}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={(v) => setStageFilter(v ?? "")}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={riverFilter} onValueChange={(v) => setRiverFilter(v ?? "")}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All rivers" />
              </SelectTrigger>
              <SelectContent>
                {rivers.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(categoryFilter || stageFilter || riverFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter("");
                  setStageFilter("");
                  setRiverFilter("");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Waste Jobs ({jobs.length})</span>
            <DemoBadge />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    No waste jobs match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.jobId}>
                    <TableCell className="font-mono text-xs">{job.jobId}</TableCell>
                    <TableCell>{job.category}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs">
                      {job.zoneName}
                    </TableCell>
                    <TableCell>{job.quantity} kg</TableCell>
                    <TableCell className="text-xs">{job.currentStageLabel}</TableCell>
                    <TableCell className="text-xs">{job.assignedTeam}</TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDialogJob(job)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {dialogJob && (
        <WasteJobDetailDialog
          job={dialogJob}
          open={!!dialogJob}
          onOpenChange={(v) => { if (!v) setDialogJob(null); }}
        />
      )}
    </div>
  );
}

export default function WasteManagementPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense>
        <WasteManagementInner />
      </Suspense>
    </div>
  );
}
