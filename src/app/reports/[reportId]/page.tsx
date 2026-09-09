import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  FileText,
  Flag,
  MapPin,
  Tag,
  User,
} from "lucide-react"

import { rivers } from "@/lib/demo-data/rivers"
import { pollutionReports } from "@/lib/demo-data/reports"
import { actions } from "@/lib/demo-data/actions"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ReportTimeline } from "@/components/reports/report-timeline"

export const dynamic = "force-dynamic"

function riverName(riverId: string): string {
  return rivers.find((r) => r.id === riverId)?.displayName ?? riverId
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>
}) {
  const { reportId } = await params

  const report = pollutionReports.find(
    (r) => r.reportNumber.toLowerCase() === reportId.toLowerCase()
  )

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="Report not found"
          description={`No report found with ID "${reportId}". It may have been removed or the ID is incorrect.`}
          action={
            <div className="flex gap-3">
              <Button render={<Link href="/reports" />}>
                <ArrowLeft className="h-4 w-4" />
                Back to Reports
              </Button>
              <Button variant="outline" render={<Link href="/report-pollution" />}>
                <Flag className="h-4 w-4" />
                Report Pollution
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  const relatedActions = actions.filter(
    (a) => a.relatedReportId === report.id
  )

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/reports" className="hover:text-emerald-600">
            Reports
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-slate-800">
            {report.reportNumber}
          </span>
        </nav>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a]">
                {report.reportNumber}
              </h1>
              <StatusBadge status={report.status} variant="status" />
              <StatusBadge status={report.severity} variant="severity" />
            </div>
            <p className="mt-1.5 text-sm text-slate-600">
              Submitted to{" "}
              <span className="font-medium">
                {riverName(report.riverId)}
              </span>
            </p>
          </div>
          <Button render={<Link href="/report-pollution" />}>
            <Flag className="h-4 w-4" />
            Report Another Issue
          </Button>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-2">
                <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                  Report Details
                </h2>
                <div className="space-y-4">
                  <DetailRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Location"
                    value={report.location}
                  />
                  <DetailRow
                    icon={<Tag className="h-4 w-4" />}
                    label="Pollution Type"
                    value={report.pollutionType}
                  />
                  <DetailRow
                    icon={<FileText className="h-4 w-4" />}
                    label="Description"
                    value={report.description}
                  />
                  <DetailRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Submitted"
                    value={new Date(report.submittedAt).toLocaleString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}
                  />
                  <DetailRow
                    icon={<User className="h-4 w-4" />}
                    label="Reporter"
                    value={report.reporterName}
                  />
                  {report.assignedTo && (
                    <DetailRow
                      icon={<User className="h-4 w-4" />}
                      label="Assigned To"
                      value={report.assignedTo}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {relatedActions.length > 0 && (
              <Card>
                <CardContent className="pt-2">
                  <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                    Related Actions
                  </h2>
                  <div className="space-y-3">
                    {relatedActions.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800">
                            {action.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {action.assignedTeam} · Due{" "}
                            {new Date(action.dueDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge
                            status={action.priority}
                            variant="priority"
                          />
                          <StatusBadge
                            status={action.status}
                            variant="status"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="pt-2">
                <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                  Status Timeline
                </h2>
                <ReportTimeline
                  status={report.status}
                  submittedAt={report.submittedAt}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm text-slate-800">{value}</p>
      </div>
    </div>
  )
}
