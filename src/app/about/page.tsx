import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  Eye,
  Flag,
  Handshake,
  Landmark,
  LifeBuoy,
  ScanLine,
  Shovel,
  Target,
  Users,
} from "lucide-react";

import { DemoBadge } from "@/components/shared/demo-badge";
import { HintLabel } from "@/components/shared/hint-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mission, pillars and target users of JAL-SURAKSHA — a smart river sanitation, monitoring and waste management platform.",
};

const values = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Citizen reports, authority actions and verified resolutions are visible and accountable on a single platform.",
  },
  {
    icon: Target,
    title: "Precision",
    description:
      "AI detection and risk scoring direct limited cleanup resources to the zones that need them most.",
  },
  {
    icon: Handshake,
    title: "Participation",
    description:
      "Communities, field teams, municipalities and regulators coordinate around one shared workflow.",
  },
  {
    icon: LifeBuoy,
    title: "Verification",
    description:
      "No action is counted as success until post-operation checks confirm the outcome.",
  },
];

const audiences = [
  {
    icon: Landmark,
    title: "Municipal & river authorities",
    description:
      "Monitor river health, triage incoming reports, assign teams and track resolution.",
  },
  {
    icon: Shovel,
    title: "Sanitation & field operators",
    description:
      "Receive cleanup jobs, record collection and transport, and confirm disposal handling.",
  },
  {
    icon: Users,
    title: "Citizens & communities",
    description:
      "Report pollution incidents, follow their status and stay informed about local water health.",
  },
];

const principles = [
  "All data in this prototype is simulated demo data — no claims of live sensing.",
  "Numbers are derived deterministically from the demo datasets bundled with the platform.",
  "The platform connects to United Nations SDG 6, 11, 12 and 14 but is not a certified SDG reporting system.",
  "Impact metrics only cover operations recorded and verified through the platform.",
];

const faqs = [
  {
    q: "Is JAL-SURAKSHA a live government service?",
    a: "No. JAL-SURAKSHA is a working prototype built to demonstrate a sustainable sanitation system for rivers. It is intended for evaluation and further development, not as an official service.",
  },
  {
    q: "Where does the data come from?",
    a: "Every number shown comes from the deterministic demo datasets shipped with the application (rivers, zones, water measurements, waste records, reports, actions and impact metrics). Nothing is streamed from real sensors.",
  },
  {
    q: "What problem does it aim to solve?",
    a: "River pollution is fragmented across agencies. JAL-SURAKSHA shows a single loop — monitor, detect, analyze, act, verify — so that cleanup effort is targeted, traceable and measurable.",
  },
  {
    q: "Can it be extended to real data?",
    a: "The data layer is intentionally simple. Real deployments could route the demo sources to live APIs for sensors, imagery and field logs without changing the interface.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="-mx-4 bg-[#0c1e3a] px-4 py-14 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
            <Droplets className="h-6 w-6 text-white" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              About JAL-SURAKSHA
            </h1>
            <p className="mt-1 text-sm text-blue-100/80">
              Sustainable Sanitation System of Rivers
            </p>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
          JAL-SURAKSHA is a smart river sanitation platform that links monitoring,
          pollution intelligence, waste management and community action into one
          accountable workflow. It helps authorities and citizens move from{" "}
          <span className="font-semibold text-emerald-300">reactive cleanup</span>{" "}
          to{" "}
          <span className="font-semibold text-emerald-300">
            targeted, verified prevention
          </span>
          .
        </p>
        <div className="mt-6">
          <DemoBadge variant="prominent" />
          <span className="ml-3 text-xs text-slate-400">
            Demonstration platform — all data is simulated.
          </span>
        </div>
      </div>

      <div className="space-y-8 py-8">
        <section>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flag className="h-4 w-4" />
            Our mission
          </div>
          <p className="mt-2 max-w-3xl text-lg leading-8 text-slate-700">
            To give every river — and every community that depends on it — a
            single system to{" "}
            <span className="font-semibold text-[#0c1e3a]">measure water health</span>,
            detect{" "}
            <span className="font-semibold text-[#0c1e3a]">pollution early</span>,
            dispatch{" "}
            <span className="font-semibold text-[#0c1e3a]">targeted cleanups</span>{" "}
            and{" "}
            <span className="font-semibold text-[#0c1e3a]">verify outcomes</span>,
            turning scattered effort into measurable change.
          </p>
        </section>

        <div>
          <HintLabel>What we value</HintLabel>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.title} size="sm">
                  <CardHeader>
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <CardTitle className="mt-2 text-sm">{v.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{v.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <HintLabel>Who it serves</HintLabel>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((a) => {
              const Icon = a.icon;
              return (
                <Card key={a.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <CardTitle className="text-sm">{a.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <HintLabel>Working principles</HintLabel>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {principles.map((principle, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-sm leading-6 text-slate-700">{principle}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <HintLabel>Frequently asked questions</HintLabel>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-xl border p-5">
                <h3 className="text-sm font-semibold text-[#0c1e3a]">{f.q}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center">
          <h2 className="text-xl font-bold text-[#0c1e3a]">
            See the system in action
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Explore the river health dashboard, the pollution map or submit a
            demo pollution report to walk the full monitoring loop.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Explore Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/technology"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Read the technology
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}