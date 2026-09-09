import { CheckCircle2, Circle, Clock } from "lucide-react"

import type { ReportStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ReportTimelineProps {
  status: ReportStatus
  submittedAt: string
}

const TIMELINE_STAGES: { label: string; key: ReportStatus }[] = [
  { label: "Submitted", key: "submitted" },
  { label: "Triaged", key: "triaged" },
  { label: "Assigned", key: "assigned" },
  { label: "Action In Progress", key: "in_progress" },
  { label: "Awaiting Verification", key: "awaiting_verification" },
  { label: "Resolved", key: "resolved" },
]

function getStatusIndex(status: ReportStatus): number {
  return TIMELINE_STAGES.findIndex((s) => s.key === status)
}

function ReportTimeline({ status, submittedAt }: ReportTimelineProps) {
  const currentIdx = getStatusIndex(status)

  return (
    <div className="relative">
      {TIMELINE_STAGES.map((stage, idx) => {
        const isCompleted = idx <= currentIdx
        const isCurrent = idx === currentIdx
        const isPending = idx > currentIdx

        return (
          <div key={stage.key} className="relative flex gap-4">
            {idx < TIMELINE_STAGES.length - 1 && (
              <div
                className={cn(
                  "absolute top-6 left-[11px] w-px",
                  isCompleted ? "bg-emerald-300" : "bg-slate-200"
                )}
                style={{ height: "calc(100% - 24px)" }}
              />
            )}

            <div className="relative z-10 flex shrink-0 items-center justify-center">
              {isCompleted && !isCurrent ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : isCurrent ? (
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
                  <Clock className="relative h-6 w-6 text-emerald-600" />
                </span>
              ) : (
                <Circle className="h-6 w-6 text-slate-300" />
              )}
            </div>

            <div className="flex-1 pb-8">
              <p
                className={cn(
                  "text-sm font-medium",
                  isCompleted ? "text-emerald-700" : isPending ? "text-slate-400" : "text-slate-700"
                )}
              >
                {stage.label}
              </p>
              {isCurrent && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {idx === 0
                    ? `Received ${new Date(submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : "Current stage"}
                </p>
              )}
              {isCompleted && !isCurrent && (
                <p className="mt-0.5 text-xs text-emerald-600">Completed</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { ReportTimeline }
export type { ReportTimelineProps }
