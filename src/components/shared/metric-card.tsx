import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "./status-badge"
import { TrendIndicator } from "./trend-indicator"

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  status?: string
  trend?: "up" | "down" | "stable"
  trendValue?: string
  icon: React.ReactNode
  description?: string
  className?: string
}

function MetricCard({
  title,
  value,
  unit,
  status,
  trend,
  trendValue,
  icon,
  description,
  className,
}: MetricCardProps) {
  const isPositiveTrend =
    (trend === "up" && title.toLowerCase().includes("score")) ||
    (trend === "up" && title.toLowerCase().includes("quality")) ||
    (trend === "up" && title.toLowerCase().includes("safe"))

  return (
    <Card className={cn("overflow-hidden", className)} size="sm">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          {unit && (
            <span className="text-sm font-medium text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {status && <StatusBadge status={status} />}
          {trend && trendValue && (
            <TrendIndicator
              value={trendValue}
              direction={trend}
              isPositive={isPositiveTrend}
            />
          )}
        </div>
        {description && (
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export { MetricCard }
