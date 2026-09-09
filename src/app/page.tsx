import Link from "next/link"
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Building2,
  ChartColumn,
  ChevronRight,
  Droplets,
  Fish,
  Flag,
  LayoutDashboard,
  Map,
  MapPin,
  MessageSquareText,
  Recycle,
  ScanLine,
  ShieldCheck,
  Shovel,
  Users,
} from "lucide-react"

import { impactMetrics } from "@/lib/demo-data/impact"
import { HealthScore } from "@/components/shared/health-score"
import { DemoBadge } from "@/components/shared/demo-badge"

const pillars = [
  {
    icon: Activity,
    title: "Monitor",
    description:
      "Track river water-quality and sanitation indicators across monitored zones with continuous sensor and satellite data.",
  },
  {
    icon: BrainCircuit,
    title: "Identify",
    description:
      "Detect and classify pollution and waste using AI image analysis, anomaly detection and evidence-weighted risk scoring.",
  },
  {
    icon: ShieldCheck,
    title: "Act",
    description:
      "Generate actionable recommendations and enable communities, authorities and operators to report and resolve incidents.",
  },
]

const workflow = [
  {
    icon: Activity,
    label: "Monitor",
    description: "Sensor & satellite telemetry",
  },
  {
    icon: ScanLine,
    label: "Detect",
    description: "AI waste & anomaly detection",
  },
  {
    icon: ChartColumn,
    label: "Analyze",
    description: "Risk scoring & trend analysis",
  },
  {
    icon: ShieldCheck,
    label: "Act",
    description: "Recommendations & response",
  },
  {
    icon: BadgeCheck,
    label: "Verify",
    description: "Community verification & impact",
  },
]

const features = [
  {
    icon: LayoutDashboard,
    title: "River Health Dashboard",
    description:
      "A command center for water quality, oxygen, pH, turbidity and waste burden with an at-a-glance composite health score.",
  },
  {
    icon: Map,
    title: "Interactive GIS Map",
    description:
      "Explore monitoring zones geographically, inspect pollution levels and drill into zone-level sensor data.",
  },
  {
    icon: BrainCircuit,
    title: "AI Waste Detection",
    description:
      "Automatically recognize plastic, sewage, industrial and organic waste from imagery with confidence scoring.",
  },
  {
    icon: MessageSquareText,
    title: "Citizen Reporting",
    description:
      "Let communities flag pollution sights directly with photos and location so nothing goes unnoticed.",
  },
  {
    icon: Shovel,
    title: "Sanitation Operations",
    description:
      "Assign cleanup crews, track disposal recommendations and verify that waste is removed end to end.",
  },
  {
    icon: ChartColumn,
    title: "Impact Analytics",
    description:
      "Measure waste removed, issues resolved and response times to prove environmental outcomes over time.",
  },
]

const sdgGoals = [
  {
    number: "06",
    icon: Droplets,
    title: "Clean Water & Sanitation",
    description:
      "Ensure availability and sustainable management of water and sanitation for all.",
  },
  {
    number: "11",
    icon: Building2,
    title: "Sustainable Cities",
    description:
      "Make cities inclusive, safe, resilient and sustainable through clean rivers.",
  },
  {
    number: "12",
    icon: Recycle,
    title: "Responsible Consumption",
    description:
      "Reduce waste generation and promote recycling throughout river catchments.",
  },
  {
    number: "14",
    icon: Fish,
    title: "Life Below Water",
    description:
      "Prevent marine and freshwater pollution to protect aquatic ecosystems.",
  },
]

function impactValue(metricName: string) {
  const item = impactMetrics.find((m) => m.metric === metricName)
  return {
    value: item ? item.value : 0,
    unit: item ? item.unit : "",
  }
}

const heroStats = [
  { label: "Monitoring Zones", icon: MapPin, ...impactValue("Monitoring Zones") },
  { label: "Pollution Reports", icon: Flag, ...impactValue("Pollution Reports") },
  { label: "Waste Removed", icon: Recycle, ...impactValue("Waste Removed") },
  { label: "Communities Engaged", icon: Users, ...impactValue("Communities Engaged") },
]

const impactStats = [
  { label: "Waste Removed", ...impactValue("Waste Removed") },
  { label: "Issues Resolved", ...impactValue("Issues Resolved") },
  { label: "Monitoring Zones", ...impactValue("Monitoring Zones") },
  { label: "Communities Engaged", ...impactValue("Communities Engaged") },
]

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-emerald-700 uppercase">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-[#0c1e3a] sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-slate-600">{description}</p>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <Pillars />
      <Workflow />
      <Impact />
      <Features />
      <SdgSection />
      <CtaSection />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0c1e3a]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 520px at 85% -10%, rgba(20,184,166,0.35), transparent 60%), radial-gradient(900px 480px at 0% 10%, rgba(16,185,129,0.22), transparent 55%), radial-gradient(800px 600px at 90% 110%, rgba(30,64,175,0.45), transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 28px)",
        }}
      />
      <div className="relative mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <DemoBadge variant="prominent" className="mb-6" />
            <h1 className="text-5xl font-extrabold tracking-[0.06em] text-white sm:text-6xl lg:text-7xl">
              JAL-SURAKSHA
            </h1>
            <p className="mt-4 text-lg font-semibold tracking-wide text-emerald-300 sm:text-xl">
              Sustainable Sanitation System of Rivers
            </p>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Smart monitoring, intelligent waste management, and community-driven
              action for cleaner and healthier rivers.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition-all hover:bg-emerald-400"
              >
                Explore Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/report-pollution"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Flag className="h-4 w-4" />
                Report Pollution
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-slate-400">
              <BadgeCheck className="h-4 w-4 text-emerald-400" />
              Real-time monitoring across 6 major Indian rivers
            </p>
          </div>

          <div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-1 text-center">
                <HealthScore
                  score={68}
                  label="River Health"
                  size="lg"
                  showTrend
                  trendValue="Composite score across monitored rivers"
                />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                      <stat.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xl font-bold text-white">
                        {Number(stat.value).toLocaleString()}
                        {typeof stat.unit === "string" && stat.unit ? (
                          <span className="ml-1 text-xs font-medium text-slate-300">
                            {stat.unit}
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Pillars() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="How it works"
          title="How JAL-SURAKSHA Works"
          description="A continuous loop — from sensing the river to triggering verified action on the ground."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              href="/dashboard"
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200 transition-transform group-hover:scale-105">
                <pillar.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold tracking-wide text-[#0c1e3a]">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {pillar.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition-colors group-hover:text-emerald-700">
                Learn more
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Workflow() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Product workflow"
          title="One Connected Pipeline"
          description="From raw signals to verified impact — every step is instrumented and accountable."
        />
        <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
          {workflow.map((step, index) => (
            <div key={step.label} className="flex flex-1 items-stretch md:flex-col">
              <div className="flex flex-1 flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-md">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="mt-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  Step {index + 1}
                </span>
                <h3 className="mt-1 text-base font-bold tracking-wide text-[#0c1e3a]">
                  {step.label}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {step.description}
                </p>
              </div>
              {index < workflow.length - 1 && (
                <div className="flex items-center justify-center md:flex items-center px-1 py-3 md:py-0">
                  <ChevronRight className="hidden h-5 w-5 rotate-90 text-slate-300 md:block md:rotate-0" />
                  <ChevronRight className="h-5 w-5 text-slate-300 md:hidden" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Impact() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Impact"
          title="Results, Measured"
          description="Prototype impact metrics tracked across monitored river catchments in the last 90 days."
        />
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {impactStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 text-center shadow-sm"
            >
              <p className="text-4xl font-extrabold tracking-tight text-[#0c1e3a]">
                {Number(stat.value).toLocaleString()}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">{stat.label}</p>
              {typeof stat.unit === "string" && stat.unit ? (
                <p className="mt-0.5 text-xs font-semibold tracking-wide text-teal-600 uppercase">
                  {stat.unit}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything Rivers Need"
          description="An integrated toolset for agencies, operators and citizens working to protect waterways."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-[#0c1e3a]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SdgSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Global goals"
          title="Aligned with the UN Sustainable Development Goals"
          description="JAL-SURAKSHA contributes directly to four of the UN's Sustainable Development Goals."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sdgGoals.map((goal) => (
            <div
              key={goal.number}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
                  <goal.icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-extrabold tracking-tight text-slate-300">
                  {goal.number}
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0c1e3a]">
                SDG {goal.number} — {goal.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {goal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1e3a] via-[#0e2a4a] to-[#0c6b58] px-6 py-16 text-center text-white sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(800px 400px at 50% -20%, rgba(20,184,166,0.3), transparent 60%)",
            }}
          />
          <div className="relative">
            <DemoBadge variant="prominent" className="mb-6" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Protect Our Rivers
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
              Join authorities, operators and communities in safeguarding India&apos;s
              rivers. Monitor, report and act — today.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition-all hover:bg-emerald-400"
              >
                Explore Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/report-pollution"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Flag className="h-4 w-4" />
                Report Pollution
              </Link>
            </div>
            <p className="mt-7 text-xs text-slate-400">
              JAL-SURAKSHA is a working prototype. All data shown is simulated
              prototype data for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}