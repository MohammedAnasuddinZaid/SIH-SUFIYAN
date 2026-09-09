"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrendIndicatorProps {
  value: string
  direction: "up" | "down" | "stable"
  isPositive: boolean
  className?: string
}

function TrendIndicator({
  value,
  direction,
  isPositive,
  className,
}: TrendIndicatorProps) {
  const Icon =
    direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        direction === "stable" && "text-muted-foreground",
        direction === "up" && isPositive && "text-emerald-600 dark:text-emerald-400",
        direction === "up" && !isPositive && "text-red-600 dark:text-red-400",
        direction === "down" && isPositive && "text-emerald-600 dark:text-emerald-400",
        direction === "down" && !isPositive && "text-red-600 dark:text-red-400",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{value}</span>
    </span>
  )
}

export { TrendIndicator }
