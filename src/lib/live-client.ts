"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveSnapshot } from "@/lib/pipeline/types";

export interface LiveFetchState {
  data: LiveSnapshot | null;
  isLoading: boolean;
  error: string | null;
  refreshedAt: Date | null;
  refresh: () => void;
}

export function useLiveSnapshot({
  refreshMs = 0,
  onError,
}: { refreshMs?: number; onError?: (msg: string) => void } = {}): LiveFetchState {
  const [data, setData] = useState<LiveSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      if (!res.ok) throw new Error(`Live API responded ${res.status}`);
      const json = (await res.json()) as LiveSnapshot;
      setData(json);
      setError(null);
      setRefreshedAt(new Date());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load live data";
      setError(msg);
      onError?.(msg);
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void load();
    if (refreshMs > 0) {
      const timer = setInterval(load, refreshMs);
      return () => clearInterval(timer);
    }
  }, [load, refreshMs]);

  return { data, isLoading, error, refreshedAt, refresh: load };
}