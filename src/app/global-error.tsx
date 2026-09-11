"use client";

import { Droplets } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary. Next.js only renders this when the top-level layout
 * itself fails, so it must render its own <html>/<body>. Replaces the bare
 * "This page couldn't load" default with JAL-SURAKSHA branding and reliable
 * recovery actions.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <title>Something went wrong | JAL-SURAKSHA</title>
      </head>
      <body className="flex min-h-full flex-col items-center justify-center bg-slate-50 px-6 py-24">
        <main className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0c1e3a]">
            <Droplets className="h-7 w-7 text-emerald-400" />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Unexpected error
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
            The page hit an unexpected error
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Our team has been notified. Please try reloading the page — if the
            problem persists, try heading home.
          </p>
          {error?.message ? (
            <p className="mt-4 max-w-md truncate rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-500">
              {error.message}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0c1e3a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#143057]"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) window.history.back();
                else window.location.href = window.location.origin + "/";
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-[#0c1e3a] transition-colors hover:bg-slate-100"
            >
              Back
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}