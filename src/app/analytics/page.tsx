import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ChartPie,
  Factory,
  Recycle,
} from "lucide-react";

import { DemoBadge } from "@/components/shared/demo-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Analytics Center",
  description:
    "Focused analytical views for water quality, pollution, waste and operational performance across monitored rivers.",
};

const hubs = [
  {
    href: "/analytics/river-health",
    icon: Activity,
    title: "River Health",
    description:
      "Water quality scores, parameter trends and zone-level health across monitored rivers.",
  },
  {
    href: "/analytics/pollution",
    icon: Factory,
    title: "Pollution",
    description:
      "Pollution source ranking, incident trends and anomalies detected by the AI layer.",
  },
  {
    href: "/analytics/waste",
    icon: Recycle,
    title: "Waste",
    description:
      "Waste composition, pipeline flow and category-level disposal across zones.",
  },
  {
    href: "/analytics/operations",
    icon: ChartPie,
    title: "Operations",
    description:
      "Report status distribution, team workload and resolution performance.",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                Analytics Center
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Focused analytical views for water quality, pollution, waste and
              operational performance.
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <Link key={hub.href} href={hub.href} className="group">
                <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-emerald-200 group-hover:shadow-md">
                  <CardHeader>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="mt-3 flex items-center justify-between text-base">
                      {hub.title}
                      <ArrowRight className="h-4 w-4 text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {hub.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          All analytics are derived deterministically from the demo datasets
          bundled with the platform.
        </p>
      </div>
    </div>
  );
}