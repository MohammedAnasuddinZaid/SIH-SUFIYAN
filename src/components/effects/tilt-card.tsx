"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
  style?: CSSProperties;
}

/**
 * 3D perspective tilt card with optional moving glare. Uses pointer position
 * to rotate the element in 3D space for a premium interactive feel.
 */
export function TiltCard({
  children,
  className,
  intensity = 12,
  glare = true,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("none");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * intensity;
    const ry = (px - 0.5) * intensity;
    setTransform(
      `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
    );
    setGlarePos({ x: px * 100, y: py * 100, opacity: 1 });
  };

  const handleLeave = () => {
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    setGlarePos((g) => ({ ...g, opacity: 0 }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transform, transformStyle: "preserve-3d", transition: "transform 160ms ease-out", ...style }}
      className={cn("relative will-change-transform", className)}
    >
      {children}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.28), transparent 55%)`,
            opacity: glarePos.opacity,
            transition: "opacity 240ms ease-out",
          }}
        />
      )}
    </div>
  );
}