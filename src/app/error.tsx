"use client";

import Link from "next/link";
import { LayoutDashboard, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-24">
      <div className="flex flex-col items-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          This page hit turbulent waters
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          An unexpected error occurred while rendering this page. You can try
          again, or head back to the dashboard.
        </p>
        {error.message && (
          <p className="mt-4 max-w-md truncate rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            {error.message}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button onClick={reset} className="bg-[#0c1e3a] text-white hover:bg-[#143057]">
            <RefreshCcw />
            Try Again
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