"use client"

import { cn } from "@/lib/utils"

interface HealthScoreProps {
  score: number
  label: string
  size?: "sm" | "md" | "lg"
  showTrend?: boolean
  trendValue?: string
  className?: string
}

const sizeMap = {
  sm: { width: 80, strokeWidth: 6, fontSize: "text-lg", labelSize: "text-xs" },
  md: { width: 120, strokeWidth: 8, fontSize: "text-2xl", labelSize: "text-sm" },
  lg: { width: 160, strokeWidth: 10, fontSize: "text-3xl", labelSize: "text-sm" },
}

function getScoreColor(score: number) {
  if (score < 40) return { stroke: "text-red-500", text: "text-red-600 dark:text-red-400", label: "Critical" }
  if (score < 60) return { stroke: "text-orange-500", text: "text-orange-600 dark:text-orange-400", label: "Poor" }
  if (score < 75) return { stroke: "text-yellow-500", text: "text-yellow-600 dark:text-yellow-400", label: "Moderate" }
  if (score < 90) return { stroke: "text-green-500", text: "text-green-600 dark:text-green-400", label: "Good" }
  return { stroke: "text-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Excellent" }
}

function HealthScore({
  score,
  label,
  size = "md",
  showTrend,
  trendValue,
  className,
}: HealthScoreProps) {
  const config = sizeMap[size]
  const color = getScoreColor(score)
  const clampedScore = Math.min(100, Math.max(0, score))
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedScore / 100) * circumference

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative">
        <svg
          width={config.width}
          height={config.width}
          viewBox={`0 0 ${config.width} ${config.width}`}
        >
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={config.strokeWidth}
          />
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            className={cn("transition-all duration-700 ease-out", color.stroke)}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${config.width / 2} ${config.width / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold leading-none", config.fontSize, color.text)}>
            {clampedScore}
          </span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className={cn("font-medium", config.labelSize)}>{label}</p>
        <p className={cn("text-xs font-medium", color.text)}>{color.label}</p>
        {showTrend && trendValue && (
          <p className="mt-0.5 text-xs text-muted-foreground">{trendValue}</p>
        )}
      </div>
    </div>
  )
}

export { HealthScore }
