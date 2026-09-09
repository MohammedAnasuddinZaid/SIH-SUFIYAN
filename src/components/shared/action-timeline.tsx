"use client"

import { cn } from "@/lib/utils"
import { CircleCheck, Circle } from "lucide-react"
import type { ActionStatus } from "@/lib/types"

interface ActionTimelineProps {
  status: ActionStatus
  className?: string
}

const TIMELINE_STEPS = [
  { key: "Created", description: "Action raised from a report or zone signal" },
  { key: "Assigned", description: "Responsible team selected and briefed" },
  { key: "Started", description: "Intervention work has begun on site" },
  { key: "Completed", description: "Work finished and handed over for verification" },
]

function stepReached(status: ActionStatus, step: string): boolean {
  switch (step) {
    case "Created":
      return true
    case "Assigned":
      return status !== "planned"
    case "Started":
      return (
        status === "in_progress" ||
        status === "completed" ||
        status === "awaiting_verification"
      )
    case "Completed":
      return status === "completed" || status === "awaiting_verification"
    default:
      return false
  }
}

function ActionTimeline({ status, className }: ActionTimelineProps) {
  const reached = TIMELINE_STEPS.map((step) =>
    stepReached(status, step.key)
  )
  const currentIndex = reached.lastIndexOf(true)

  return (
    <ol className={cn("space-y-0", className)}>
      {TIMELINE_STEPS.map((step, index) => {
        const done = reached[index]
        const isCurrent = index === currentIndex
        const isLast = index === TIMELINE_STEPS.length - 1

        return (
          <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-6 left-[13px] h-[calc(100%-1.5rem)] w-px",
                  reached[index + 1]
                    ? "bg-emerald-500/70"
                    : "bg-muted-foreground/20"
                )}
              />
            )}
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-background",
                done
                  ? "bg-emerald-500/15 text-emerald-600"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {done ? (
                <CircleCheck className="h-4 w-4" />
              ) : (
                <Circle
                  className={cn(
                    "h-4 w-4 text-muted-foreground/40",
                    isCurrent && "text-muted-foreground"
                  )}
                />
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-medium",
                    done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.key}
                </p>
                {isCurrent && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export { ActionTimeline }