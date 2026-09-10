"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (v: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 900,
  formatter,
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTarget = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    lastTarget.current = to;
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const text = formatter ? formatter(display) : Math.round(display).toLocaleString();
  return <span className={className}>{text}</span>;
}