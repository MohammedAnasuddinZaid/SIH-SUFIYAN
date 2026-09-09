"use client";

import {
  Trash2,
  FileWarning,
  CheckCircle2,
  Radar,
  Users,
  Recycle,
  MapPin,
  Droplets,
  Building2,
  Waves,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoBadge } from "@/components/shared/demo-badge";
import { MetricCard } from "@/components/shared/metric-card";
import { SectionHeader } from "@/components/shared/section-header";
import { impactMetrics } from "@/lib/demo-data/impact";
import {
  getImpactFunnel,
  getMonthlyWasteRemoved,
} from "@/lib/impact-utils";

const METHODOLOGY = [
  {
    metric: "Waste Removed",
    definition:
      "Verified quantity of waste collected and diverted to authorized recovery or treatment.",
    calculation: "SUM(verified collected quantity)",
    source: "Sanitation team collection logs (demo)",
    period: "Last 90 days",
    limitations:
      "Does not itself prove ecological recovery. Only covers waste handled through verified operations.",
  },
  {
    metric: "Pollution Reports",
    definition:
      "Reports of pollution incidents received through the platform.",
    calculation: "COUNT(pollution reports)",
    source: "Citizen and sensor reports (demo)",
    period: "Last 90 days",
    limitations:
      "Reflects reporting activity, not necessarily the true incidence of pollution.",
  },
  {
    metric: "Issues Resolved",
    definition:
      "Pollution incidents that reached a verified resolved state.",
    calculation: "COUNT(incidents with status = resolved)",
    source: "Incident lifecycle records (demo)",
    period: "Last 90 days",
    limitations:
      "Resolution refers to operational closure of records, not long-term ecological outcome.",
  },
  {
    metric: "Monitoring Zones",
    definition:
      "Number of river monitoring zones actively sampled by the platform.",
    calculation: "COUNT(active monitoring zones)",
    source: "Monitoring network configuration (demo)",
    period: "Current",
    limitations:
      "Coverage is limited to configured zones and does not represent full waterbody coverage.",
  },
];

const ENVIRONMENTAL_IMPACTS = [
  {
    icon: Recycle,
    title: "Waste diverted to authorized recovery",
    detail:
      "Waste is routed to facilities matched to its category, keeping material out of waterbodies.",
  },
  {
    icon: CheckCircle2,
    title: "Pollution incidents resolved",
    detail:
      "Cases tracked through verification and closed with documented follow-up.",
  },
  {
    icon: MapPin,
    title: "Monitoring coverage",
    detail:
      "Sensor and citizen observations on fixed river zones within the pilot area.",
  },
  {
    icon: Users,
    title: "Community participation",
    detail:
      "Reporters and community teams engaged through the reporting workflow.",
  },
];

const SDGS = [
  {
    icon: Droplets,
    target: "SDG 6",
    title: "Clean Water and Sanitation",
    relation:
      "Monitoring and waste removal contribute to reducing water pollution and improving water quality management in monitored rivers.",
  },
  {
    icon: Building2,
    target: "SDG 11",
    title: "Sustainable Cities and Communities",
    relation:
      "Operational cleanup and reporting help reduce environmental impacts from urban waste in river corridors.",
  },
  {
    icon: Recycle,
    target: "SDG 12",
    title: "Responsible Consumption and Production",
    relation:
      "Routing waste to authorized recovery facilities supports responsible waste handling rather than uncontrolled dumping.",
  },
  {
    icon: Waves,
    target: "SDG 14",
    title: "Life Below Water",
    relation:
      "Reducing plastic and pollutant loads entering rivers can reduce downstream marine pollution.",
  },
];

function getMetricValue(label: string, fallback: number) {
  const m = impactMetrics.find((i) => i.metric === label);
  return typeof m?.value === "number" ? m.value : fallback;
}

export default function ImpactPage() {
  const funnel = getImpactFunnel();
  const monthly = getMonthlyWasteRemoved();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      {/* Hero band */}
      <div className="-mx-4 bg-gradient-to-br from-[#0b1d33] via-[#0e2a4a] to-[#123b66] px-4 py-12 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Measure Our Impact
          </h1>
          <DemoBadge variant="prominent" />
        </div>
        <p className="mt-3 max-w-2xl text-sm text-blue-100/80">
          Monitoring → Action → Verification → Measured Outcome
        </p>
        <p className="mt-2 max-w-2xl text-xs text-blue-100/60">
          Prototype / demonstration data — all numbers below are derived from demo
          operational records and do not reflect real-world monitoring results.
        </p>
      </div>

      <div className="space-y-8 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Waste Removed"
            value={(getMetricValue("Waste Removed", 2840)).toLocaleString()}
            unit="kg"
            icon={<Trash2 className="h-4 w-4" />}
            trend="up"
            trendValue="12% vs prior"
          />
          <MetricCard
            title="Pollution Reports"
            value={getMetricValue("Pollution Reports", 426)}
            unit="reports"
            icon={<FileWarning className="h-4 w-4" />}
            trend="up"
            trendValue="8% vs prior"
          />
          <MetricCard
            title="Issues Resolved"
            value={getMetricValue("Issues Resolved", 318)}
            unit="issues"
            icon={<CheckCircle2 className="h-4 w-4" />}
            trend="up"
            trendValue="9% vs prior"
          />
          <MetricCard
            title="Monitoring Zones"
            value={getMetricValue("Monitoring Zones", 32)}
            unit="zones"
            icon={<Radar className="h-4 w-4" />}
          />
          <MetricCard
            title="Communities Engaged"
            value={getMetricValue("Communities Engaged", 18)}
            unit="communities"
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        <Card>
          <CardHeader>
            <SectionHeader
              title="Impact Funnel"
              description="Conversion from reports received to verified resolution over the last 90 days (demo)."
              action={<DemoBadge />}
            />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [
                    Number(value ?? 0).toLocaleString(),
                    "Count",
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.label ?? label;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {funnel.map((f, i) => {
                const prev =
                  i > 0
                    ? Math.round((f.count / funnel[i - 1].count) * 100)
                    : 100;
                return (
                  <div
                    key={f.stage}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{f.stage}</span>
                    <span className="text-muted-foreground">
                      <span className="font-bold text-foreground">{f.count}</span>{" "}
                      <span className="text-xs">
                        {f.label} {i > 0 && `· ${prev}% of previous`}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Conversion percentages are relative to the previous funnel stage and are
              derived from demo data.
            </p>
          </CardContent>
        </Card>

        <div>
          <SectionHeader
            title="Impact Methodology"
            description="How each headline metric is defined and calculated."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {METHODOLOGY.map((m) => (
              <Card key={m.metric}>
                <CardHeader>
                  <CardTitle className="text-sm">{m.metric}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Definition
                    </p>
                    <p className="mt-0.5">{m.definition}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 font-mono text-xs">
                    {m.calculation}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">Source: </span>
                      {m.source}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Period: </span>
                      {m.period}
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                    {m.limitations}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader
            title="Environmental Impact"
            description="Impacts are based on records with verified operational outcomes."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ENVIRONMENTAL_IMPACTS.map((imp) => {
              const Icon = imp.icon;
              return (
                <Card key={imp.title} size="sm">
                  <CardHeader>
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="mt-2 text-sm">{imp.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{imp.detail}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Impact metrics are based on records with verified operational outcomes
            (prototype demonstration data).
          </p>
        </div>

        <div>
          <SectionHeader
            title="SDG Alignment"
            description="Mapping of platform activity to UN Sustainable Development Goals."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SDGS.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.target} size="sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm">
                        <span className="font-bold">{s.target}</span>
                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                          {s.title}
                        </span>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{s.relation}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            We only show relationships that are defensible; this is not official SDG
            measurement certification.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Waste Removed</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value ?? 0).toLocaleString()} kg`,
                    "Waste removed",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted-foreground">
              Prototype demonstration data — deterministic series for display purposes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}