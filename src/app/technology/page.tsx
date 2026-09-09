import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ChartColumn,
  Box,
  MapPin,
  Microscope,
  Radar,
  Satellite,
  ScanLine,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

import { DemoBadge } from "@/components/shared/demo-badge";
import { HintLabel } from "@/components/shared/hint-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Technology — JAL-SURAKSHA",
  description:
    "How JAL-SURAKSHA senses, detects, analyzes and acts on river pollution using sensors, AI, GIS and operational workflows.",
};

const stages = [
  {
    icon: Activity,
    step: "01",
    title: "Monitor & Sense",
    description:
      "Continuous water-parameter sampling (pH, dissolved oxygen, turbidity, BOD/COD) plus periodic satellite and drone revisits define a baseline for every zone.",
  },
  {
    icon: ScanLine,
    step: "02",
    title: "Detect",
    description:
      "Computer-vision models classify waste in imagery and flag anomalies when measurements deviate from expected baselines.",
  },
  {
    icon: ChartColumn,
    step: "03",
    title: "Analyze",
    description:
      "Risk scoring combines water quality, waste burden, incident history and community signals into prioritized evidence.",
  },
  {
    icon: ShieldCheck,
    step: "04",
    title: "Act & Verify",
    description:
      "Recommendations become cleanup jobs; post-operation verification closes the loop so outcomes are recorded, not assumed.",
  },
];

const stack = [
  {
    icon: Satellite,
    title: "Remote sensing layer",
    description:
      "Imagery sources (satellite/drone) processed for river surface waste and changes over time. In this prototype the outputs are demo datasets.",
  },
  {
    icon: Box,
    title: "IoT & water-quality layer",
    description:
      "Sensor telemetry for pH, dissolved oxygen, turbidity, BOD and COD per monitoring zone. Bundled as deterministic demo measurements.",
  },
  {
    icon: BrainCircuit,
    title: "AI intelligence layer",
    description:
      "Waste detection, anomaly detection and confidence-weighted risk scoring that translate raw signals into ranked recommendations.",
  },
  {
    icon: MapPin,
    title: "GIS & mapping layer",
    description:
      "Interactive river map with monitoring zones, reports and waste records rendered as GeoJSON layers using MapLibre GL.",
  },
  {
    icon: ServerCog,
    title: "Operations layer",
    description:
      "Report triage, team assignment, action tracking and verification workflows that route intelligence into ground action.",
  },
  {
    icon: Microscope,
    title: "Reporting & analytics layer",
    description:
      "Dashboards, trend charts and impact metrics that show what the system is measuring, doing and achieving.",
  },
];

const notes = [
  "Locations and measurements are representative values for demonstration, not live telemetry.",
  "AI confidence values are part of the demo data and illustrate how decision-making could be evidence-weighted.",
  "The platform is designed so demo data can be swapped for real APIs without interface changes.",
];

export default function TechnologyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="-mx-4 bg-gradient-to-br from-[#0b1d33] via-[#0e2a4a] to-[#123b66] px-4 py-14 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
            <Radar className="h-6 w-6 text-white" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Technology
            </h1>
            <p className="mt-1 text-sm text-blue-100/80">
              How the platform senses, detects, analyzes and acts
            </p>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
          JAL-SURAKSHA is an end-to-end pipeline — from river telemetry to verified
          cleanup. Each layer is intentionally simple and swappable, so a real
          deployment could replace demo feeds with live sensors and imagery without
          changing the interface.
        </p>
        <div className="mt-6">
          <DemoBadge variant="prominent" />
          <span className="ml-3 text-xs text-slate-400">
            Interfaces are real; the underlying feeds are simulated.
          </span>
        </div>
      </div>

      <div className="space-y-8 py-8">
        <section>
          <HintLabel>The monitoring loop</HintLabel>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.step} size="sm" className="relative">
                  <span className="absolute top-4 right-4 text-3xl font-extrabold text-slate-100">
                    {s.step}
                  </span>
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-2 text-sm">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {s.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <HintLabel>Platform layers</HintLabel>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((t) => {
              const Icon = t.icon;
              return (
                <Card key={t.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <CardTitle className="text-sm">{t.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {t.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <HintLabel>Engineering notes</HintLabel>
          <div className="mt-4 grid gap-3">
            {notes.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
              >
                <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm leading-6 text-amber-900">{note}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center">
          <h2 className="text-xl font-bold text-[#0c1e3a]">
            See the intelligence in action
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Open the AI detection lab or the pollution analysis to see how waste
            classification and risk scoring are presented.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/waste-detection"
              className="group inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Open AI Detection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/pollution-analysis"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Pollution Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}