import { cn } from "@/lib/utils"

type StatusVariant = "status" | "severity" | "risk" | "priority"

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
}

const statusColors: Record<string, string> = {
  submitted:
    "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  triaged:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  assigned:
    "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  in_progress:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  completed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  verified:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  resolved:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  rejected:
    "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
}

const severityColors: Record<string, string> = {
  low: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  moderate:
    "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  critical:
    "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
}

const priorityColors: Record<string, string> = {
  low: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  medium:
    "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  urgent:
    "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
}

const colorMap: Record<StatusVariant, Record<string, string>> = {
  status: statusColors,
  severity: severityColors,
  risk: severityColors,
  priority: priorityColors,
}

function StatusBadge({ status, variant = "status", className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_")
  const colors = colorMap[variant][normalizedStatus] ?? "bg-muted text-muted-foreground"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        colors,
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  )
}

export { StatusBadge }
