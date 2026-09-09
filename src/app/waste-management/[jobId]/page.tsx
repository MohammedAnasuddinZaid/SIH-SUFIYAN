import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoBadge } from "@/components/shared/demo-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { wasteRecords } from "@/lib/demo-data/waste";
import { actions } from "@/lib/demo-data/actions";
import { getZoneById } from "@/lib/demo-data/monitoring-zones";

const PIPELINE_STAGES = [
  { key: "detection", label: "Detection" },
  { key: "segregation", label: "Segregation" },
  { key: "collection", label: "Collection" },
  { key: "transportation", label: "Transportation" },
  { key: "treatment", label: "Treatment" },
  { key: "verification", label: "Verification" },
] as const;

type StageKey = (typeof PIPELINE_STAGES)[number]["key"];

function actionStatusToStage(status: string | undefined): StageKey {
  if (!status) return "detection";
  if (status === "planned") return "segregation";
  if (status === "assigned") return "collection";
  if (status === "in_progress") return "transportation";
  if (status === "completed") return "treatment";
  if (status === "awaiting_verification") return "verification";
  return "detection";
}

function stageIndex(key: StageKey): number {
  return PIPELINE_STAGES.findIndex((s) => s.key === key);
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

export default async function WasteJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const match = jobId.match(/^WJ-2026-(\d+)$/);
  const index = match ? parseInt(match[1], 10) - 1 : -1;

  if (index < 0 || index >= wasteRecords.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          icon={<ArrowLeft className="h-6 w-6" />}
          title="Job not found"
          description={`No waste job found with ID "${jobId}".`}
          action={
            <Button variant="outline" render={<Link href="/waste-management" />}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Waste Management
            </Button>
          }
        />
      </div>
    );
  }

  const record = wasteRecords[index];
  const zone = getZoneById(record.zoneId);
  const action = actions.find((a) => a.zoneId === record.zoneId);
  const currentStageKey = actionStatusToStage(action?.status);
  const collectedApprox = Math.round(record.weightKg * 0.72);
  const treatedApprox = Math.round(collectedApprox * 0.85);
  const variance = collectedApprox - treatedApprox;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <Button variant="ghost" size="sm" render={<Link href="/waste-management" />}>
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back to Waste Management
          </Button>
        </div>

        <SectionHeader
          title={jobId}
          description={`${record.category} waste from ${zone?.name ?? record.zoneId}`}
          action={<DemoBadge />}
        />

        <div className="grid gap-4 sm:grid-cols-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-xs text-muted-foreground">Category</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{record.category}</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-xs text-muted-foreground">Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{zone?.name ?? record.zoneId}</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-xs text-muted-foreground">Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{record.weightKg} kg</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-xs text-muted-foreground">Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{record.confidence}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pipeline Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {PIPELINE_STAGES.map((stage, i) => {
                const sIdx = stageIndex(stage.key);
                const cIdx = stageIndex(currentStageKey);
                const isCompleted = sIdx < cIdx;
                const isActive = sIdx === cIdx;

                return (
                  <div key={stage.key} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCompleted
                          ? "bg-green-100 text-green-700"
                          : isActive
                            ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted
                            ? "text-green-700"
                            : isActive
                              ? "text-blue-700"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stage.label}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        isCompleted
                          ? "completed"
                          : isActive
                            ? "in_progress"
                            : "pending"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Source Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Detected At</p>
                <p className="mt-0.5 text-sm font-medium">
                  {new Date(record.detectedAt).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Disposal Recommendation</p>
                <p className="mt-0.5 text-sm font-medium">
                  {record.disposalRecommendation}
                </p>
              </div>
            </div>
            {action && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Related Action</p>
                <p className="mt-0.5 text-sm font-medium">{action.title}</p>
                <p className="text-xs text-muted-foreground">
                  Team: {action.assignedTeam} · Priority: {action.priority} · Due:{" "}
                  {action.dueDate}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Collection &amp; Transport Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Collection Vehicle</p>
                <p className="mt-0.5 text-sm font-medium">
                  TRK-{String(index + 1).padStart(3, "0")}
                </p>
                <p className="text-xs text-muted-foreground">Status: Available</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Transport Facility</p>
                <p className="mt-0.5 text-sm font-medium">
                  {record.disposalRecommendation}
                </p>
                <p className="text-xs text-muted-foreground">
                  ~{Math.round(record.weightKg * 0.92)} kg transferred
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Treatment Date</p>
                <p className="mt-0.5 text-sm font-medium">2026-09-10 (demo)</p>
                <p className="text-xs text-muted-foreground">
                  {treatedApprox} kg treated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <StatusBadge status={getStatusLabel(action?.status)} />
              <span className="text-sm text-muted-foreground">
                {action?.status === "awaiting_verification"
                  ? "Verification pending — awaiting post-treatment compliance review."
                  : action?.status === "completed"
                    ? "Treatment complete. Awaiting verification."
                    : "Processing in pipeline."}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mass Balance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Detected</p>
                <p className="mt-0.5 text-lg font-bold">{record.weightKg} kg</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Estimated Collected</p>
                <p className="mt-0.5 text-lg font-bold">{collectedApprox} kg</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Estimated Treated</p>
                <p className="mt-0.5 text-lg font-bold">{treatedApprox} kg</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Variance</p>
                <p className="mt-0.5 text-lg font-bold">{variance} kg</p>
                <p className="text-xs text-muted-foreground">
                  ~{Math.round((variance / record.weightKg) * 100)}% processing loss
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Mass balance is derived from prototype estimates. Detected weight is from AI
              detection; collected and treated values are approximations from demo operational data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
