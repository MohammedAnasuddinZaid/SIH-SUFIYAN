import { cn } from "@/lib/utils";

interface HintLabelProps {
  children: React.ReactNode;
  className?: string;
}

function HintLabel({ children, className }: HintLabelProps) {
  return (
    <h2
      className={cn(
        "text-sm font-semibold tracking-wide text-[#0c1e3a] uppercase",
        className
      )}
    >
      {children}
    </h2>
  );
}

export { HintLabel };