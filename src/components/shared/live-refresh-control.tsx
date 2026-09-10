"use client";

import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";

export const LIVE_INTERVALS = [
  { label: "Pause", ms: 0 },
  { label: "5s", ms: 5_000 },
  { label: "10s", ms: 10_000 },
  { label: "30s", ms: 30_000 },
  { label: "60s", ms: 60_000 },
] as const;

export function LiveRefreshControl({
  value,
  onChange,
  className,
  variant = "light",
}: {
  value: number;
  onChange: (ms: number) => void;
  className?: string;
  variant?: "light" | "dark";
}) {
  const dark = variant === "dark";
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border p-1 shadow-sm",
        dark ? "border-white/15 bg-white/10" : "border-slate-200 bg-white",
        className
      )}
    >
      <span
        className={cn(
          "hidden items-center gap-1 pr-1 pl-2 text-[11px] font-semibold tracking-wide uppercase sm:flex",
          dark ? "text-slate-300" : "text-slate-500"
        )}
      >
        <Zap className="h-3.5 w-3.5 text-teal-500" />
        Refresh
      </span>
      {LIVE_INTERVALS.map((opt) => {
        const active = value === opt.ms;
        return (
          <button
            key={opt.ms}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.ms)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors",
              active
                ? opt.ms === 0
                  ? "bg-slate-700 text-white"
                  : "bg-emerald-500 text-white shadow-sm"
                : dark
                  ? "text-slate-200 hover:bg-white/10"
                  : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}