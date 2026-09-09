import { cn } from "@/lib/utils"

interface DemoBadgeProps {
  variant?: "subtle" | "prominent"
  className?: string
}

function DemoBadge({ variant = "subtle", className }: DemoBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "subtle" &&
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        variant === "prominent" &&
          "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:ring-emerald-800",
        className
      )}
    >
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Prototype Data
    </span>
  )
}

export { DemoBadge }
