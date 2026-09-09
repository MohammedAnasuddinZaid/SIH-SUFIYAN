"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { rivers } from "@/lib/demo-data/rivers"
import { pollutionReports } from "@/lib/demo-data/reports"
import type { ReportStatus, Severity } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { DemoBadge } from "@/components/shared/demo-badge"

const ALL_STATUSES: ReportStatus[] = [
  "submitted",
  "triaged",
  "assigned",
  "in_progress",
  "awaiting_verification",
  "resolved",
]

const SEVERITY_OPTIONS: Severity[] = ["Low", "Moderate", "High", "Critical"]

const PAGE_SIZE = 10

function ReportsContent() {
  const router = useRouter()

  const [riverFilter, setRiverFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = pollutionReports.filter((r) => {
    if (riverFilter !== "all" && r.riverId !== riverFilter) return false
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    if (severityFilter !== "all" && r.severity !== severityFilter) return false
    if (search) {
      const term = search.toLowerCase()
      if (
        !r.reportNumber.toLowerCase().includes(term) &&
        !r.location.toLowerCase().includes(term)
      )
        return false
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const totalReports = pollutionReports.length
  const activeReports = pollutionReports.filter(
    (r) => r.status !== "resolved"
  ).length
  const resolvedReports = pollutionReports.filter(
    (r) => r.status === "resolved"
  ).length
  const criticalReports = pollutionReports.filter(
    (r) => r.severity === "Critical"
  ).length

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                Pollution Reports
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Track citizen and system-reported pollution incidents.
            </p>
          </div>
          <Button render={<Link href="/report-pollution" />}>
            <Flag className="h-4 w-4" />
            Report Pollution
          </Button>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Reports", value: totalReports, color: "bg-slate-50 text-slate-700" },
            { label: "Active", value: activeReports, color: "bg-blue-50 text-blue-700" },
            { label: "Resolved", value: resolvedReports, color: "bg-emerald-50 text-emerald-700" },
            { label: "Critical", value: criticalReports, color: "bg-red-50 text-red-700" },
          ].map((stat) => (
            <Card key={stat.label} size="sm">
              <CardContent className="pt-2">
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className={cn("mt-1 text-2xl font-bold tabular-nums", stat.color.split(" ")[1])}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Card>
            <CardContent className="pt-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by report ID or location…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={riverFilter}
                  onValueChange={(v) => {
                    setRiverFilter(v ?? "all")
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-44" aria-label="Filter by river">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All rivers</SelectItem>
                    {rivers.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v ?? "all")
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-40" aria-label="Filter by status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={severityFilter}
                  onValueChange={(v) => {
                    setSeverityFilter(v ?? "all")
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-36" aria-label="Filter by severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severity</SelectItem>
                    {SEVERITY_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {paged.length === 0 ? (
                <EmptyState
                  icon={<Search className="h-5 w-5" />}
                  title="No reports match"
                  description="Try adjusting your filters or search query."
                />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report ID</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="hidden sm:table-cell">Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Submitted</TableHead>
                        <TableHead className="hidden lg:table-cell">Reporter</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paged.map((report) => (
                        <TableRow
                          key={report.id}
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(`/reports/${report.reportNumber}`)
                          }
                        >
                          <TableCell className="font-mono text-xs font-semibold">
                            {report.reportNumber}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate text-slate-600">
                            {report.location}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-slate-600">
                            {report.pollutionType}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={report.severity}
                              variant="severity"
                            />
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={report.status}
                              variant="status"
                            />
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-500">
                            {new Date(report.submittedAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-600">
                            {report.reporterName}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500">
                      Showing {(safePage - 1) * PAGE_SIZE + 1}–
                      {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
                      {filtered.length} reports
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Prev
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - safePage) <= 1
                        )
                        .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                            acc.push("ellipsis")
                          }
                          acc.push(p)
                          return acc
                        }, [])
                        .map((item, idx) =>
                          item === "ellipsis" ? (
                            <span
                              key={`e-${idx}`}
                              className="px-1 text-sm text-slate-400"
                            >
                              …
                            </span>
                          ) : (
                            <Button
                              key={item}
                              variant={safePage === item ? "default" : "outline"}
                              size="sm"
                              className="min-w-[32px]"
                              onClick={() => setPage(item)}
                            >
                              {item}
                            </Button>
                          )
                        )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage >= totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  return <ReportsContent />
}
