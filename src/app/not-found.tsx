import Link from "next/link";
import { Droplets, Home, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-24">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0c1e3a]">
          <Droplets className="h-8 w-8 text-emerald-400" />
        </span>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          The page you are looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back to the river.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button render={<Link href="/" />} className="bg-[#0c1e3a] text-white hover:bg-[#143057]">
            <Home />
            Go Home
          </Button>
          <Button render={<Link href="/dashboard" />} variant="outline">
            <LayoutDashboard />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}