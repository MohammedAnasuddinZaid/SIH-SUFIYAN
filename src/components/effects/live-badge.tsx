import { cn } from "@/lib/utils";
import type { DataStatus } from "@/lib/pipeline/types";

interface LiveBadgeProps {
  status: DataStatus;
  className?: string;
}

const CONFIG: Record<DataStatus, { label: string; dot: string; classes: string }> = {
  live: {
    label: "LIVE",
    dot: "bg-emerald-500",
    classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  estimated: {
    label: "ESTIMATED",
    dot: "bg-amber-500",
    classes: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  simulated: {
    label: "SIMULATED",
    dot: "bg-slate-400",
    classes: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

export function LiveBadge({ status, className }: LiveBadgeProps) {
  const config = CONFIG[status] ?? CONFIG.simulated;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] ring-1 uppercase",
        config.classes,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", config.dot)} />
      </span>
      {config.label}
    </span>
  );
}