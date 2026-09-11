"use client";

import Link from "next/link";
import { Droplets, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-24">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
          <Droplets className="h-7 w-7 text-emerald-600" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Something went wrong
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          This page hit an unexpected error
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred while rendering this page. Try again, or
          head home — saved data is not affected.
        </p>
        {error?.message ? (
          <p className="mt-4 max-w-md truncate rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <Button onClick={reset} className="bg-[#0c1e3a] text-white hover:bg-[#143057]">
            <RefreshCcw className="h-4 w-4" />
            Retry Now
          </Button>
          <Button render={<Link href="/" />} variant="outline">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}