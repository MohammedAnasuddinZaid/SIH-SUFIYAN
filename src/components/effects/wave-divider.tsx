import { cn } from "@/lib/utils";

export function WaveDivider({
  className,
  flip = false,
  color = "#0c1e3a",
}: {
  className?: string;
  flip?: boolean;
  color?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none relative w-full overflow-hidden leading-0", flip && "rotate-180", className)}
    >
      <svg
        className="block h-[42px] w-full sm:h-[64px]"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,40 C240,90 480,0 720,35 C960,70 1200,20 1440,55 L1440,90 L0,90 Z"
          fill={color}
          opacity="1"
        />
        <path
          d="M0,55 C260,15 520,85 780,50 C1040,15 1240,70 1440,40 L1440,90 L0,90 Z"
          fill={color}
          opacity="0.35"
        />
      </svg>
    </div>
  );
}