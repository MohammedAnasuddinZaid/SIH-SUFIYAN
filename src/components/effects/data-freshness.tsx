"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DataFreshnessProps {
  updatedAt: string | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

function formatAge(seconds: number): string {
  if (seconds < 30) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function DataFreshness({ updatedAt, isLoading, onRefresh, className }: DataFreshnessProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const age = updatedAt ? Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000) : null;
  const stale = age !== null && age > 600;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        stale ? "border-amber-300 bg-amber-50 text-amber-700" : "border-muted bg-muted/50 text-muted-foreground",
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", isLoading ? "animate-pulse bg-sky-400" : stale ? "bg-amber-500" : "bg-emerald-500")} />
      {isLoading ? "Syncing…" : `Updated ${age === null ? "—" : formatAge(age)}`}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="ml-1 text-blue-600 underline decoration-dotted underline-offset-2 hover:text-blue-800"
        >
          Refresh
        </button>
      )}
    </div>
  );
}