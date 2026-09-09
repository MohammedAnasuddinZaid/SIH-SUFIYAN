"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Download,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { rivers } from "@/lib/demo-data/rivers"
import type {
  PollutionReport,
  Priority,
  ReportStatus,
  Severity,
} from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

export type OperationalReport = PollutionReport & { priority: Priority }

interface ReportOperationsTableProps {
  reports: OperationalReport[]
  statusFilter: string
  severityFilter: string
  onStatusFilterChange: (value: string) => void
  onSeverityFilterChange: (value: string) => void
  onTriage: (
    id: string,
    patch: { severity: Severity; status: ReportStatus; priority: Priority }
  ) => void
  onAssign: (id: string, team: string) => void
}

const TEAMS = [
  "Sanitation Team A",
  "Sanitation Team B",
  "Sanitation Team C",
  "Rapid Response",
  "Water Quality Unit",
  "Quality Assurance",
]

const STATUS_OPTIONS: ReportStatus[] = [
  "submitted",
  "triaged",
  "assigned",
  "in_progress",
  "awaiting_verification",
  "resolved",
]

const SEVERITY_OPTIONS: Severity[] = ["Low", "Moderate", "High", "Critical"]

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const PRIORITY_RANK: Record<Priority, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Urgent: 3,
}

const STATUS_RANK: Record<ReportStatus, number> = {
  submitted: 0,
  triaged: 1,
  assigned: 2,
  in_progress: 3,
  awaiting_verification: 4,
  resolved: 5,
}

type SortKey = "newest" | "oldest" | "severity" | "status"

function derivePriority(severity: Severity): Priority {
  switch (severity) {
    case "Critical":
      return "Urgent"
    case "High":
      return "High"
    case "Moderate":
      return "Medium"
    case "Low":
      return "Low"
  }
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  const date = `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
  return `${date} · ${time}`
}

function ReportOperationsTable({
  reports,
  statusFilter,
  severityFilter,
  onStatusFilterChange,
  onSeverityFilterChange,
  onTriage,
  onAssign,
}: ReportOperationsTableProps) {
  const [search, setSearch] = useState("")
  const [riverFilter, setRiverFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey | null>(null)

  const [triageTarget, setTriageTarget] = useState<OperationalReport | null>(null)
  const [triageSeverity, setTriageSeverity] = useState<Severity>("Moderate")
  const [triagePriority, setTriagePriority] = useState<Priority>("Medium")
  const [triageStatus, setTriageStatus] = useState<ReportStatus>("triaged")

  const [assignTarget, setAssignTarget] = useState<OperationalReport | null>(null)
  const [assignTeam, setAssignTeam] = useState<string>(TEAMS[0])

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter
    const matchesSeverity =
      severityFilter === "all" || report.severity === severityFilter
    const matchesRiver =
      riverFilter === "all" || report.riverId === riverFilter
    const term = search.trim().toLowerCase()
    const matchesSearch =
      !term ||
      [
        report.reportNumber,
        report.location,
        report.pollutionType,
        report.description,
        report.reporterName,
        report.assignedTo ?? "",
      ].some((value) => value.toLowerCase().includes(term))

    return matchesStatus && matchesSeverity && matchesRiver && matchesSearch
  })

  const visibleReports = (() => {
    const list = [...filteredReports]
    if (!sortKey) return list
    switch (sortKey) {
      case "newest":
        list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
        break
      case "oldest":
        list.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
        break
      case "severity":
        list.sort(
          (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
        )
        break
      case "status":
        list.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])
        break
    }
    return list
  })()

  function toggleSort(key: SortKey) {
    setSortKey((prev) => (prev === key ? null : key))
  }

  function exportCsv() {
    const header = [
      "Report Number",
      "Location",
      "Type",
      "Severity",
      "Priority",
      "Status",
      "Assigned Team",
      "Submitted",
      "Reporter",
    ]
    const rows = visibleReports.map((report) => [
      report.reportNumber,
      report.location,
      report.pollutionType,
      report.severity,
      report.priority,
      report.status,
      report.assignedTo ?? "",
      report.submittedAt,
      report.reporterName,
    ])
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `authority-reports-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function openTriage(report: OperationalReport) {
    setTriageTarget(report)
    setTriageSeverity(report.severity)
    setTriagePriority(report.priority)
    setTriageStatus(report.status)
  }

  function handleTriageSeverityChange(value: string | null) {
    if (!value) return
    const severity = value as Severity
    setTriageSeverity(severity)
    setTriagePriority(derivePriority(severity))
  }

  function confirmTriage() {
    if (!triageTarget) return
    onTriage(triageTarget.id, {
      severity: triageSeverity,
      priority: triagePriority,
      status: triageStatus,
    })
    setTriageTarget(null)
  }

  function openAssign(report: OperationalReport) {
    setAssignTarget(report)
    setAssignTeam(
      report.assignedTo && TEAMS.includes(report.assignedTo)
        ? report.assignedTo
        : TEAMS[0]
    )
  }

  function confirmAssign() {
    if (!assignTarget) return
    onAssign(assignTarget.id, assignTeam)
    setAssignTarget(null)
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ID, location, type, reporter…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusFilterChange(String(value))}
          >
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={severityFilter}
            onValueChange={(value) => onSeverityFilterChange(String(value))}
          >
            <SelectTrigger className="w-36" aria-label="Filter by severity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severity</SelectItem>
              {SEVERITY_OPTIONS.map((severity) => (
                <SelectItem key={severity} value={severity}>
                  {severity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={riverFilter}
            onValueChange={(value) => setRiverFilter(String(value))}
          >
            <SelectTrigger className="w-44" aria-label="Filter by river">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rivers</SelectItem>
              {rivers.map((river) => (
                <SelectItem key={river.id} value={river.id}>
                  {river.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-muted-foreground">Sort:</span>
            <SortButton
              label="Submitted"
              active={sortKey === "newest" || sortKey === "oldest"}
              direction={sortKey === "oldest" ? "asc" : "desc"}
              onClick={() =>
                toggleSort(sortKey === "newest" ? "oldest" : "newest")
              }
            />
            <SortButton
              label="Severity"
              active={sortKey === "severity"}
              direction="desc"
              onClick={() => toggleSort("severity")}
            />
            <SortButton
              label="Status"
              active={sortKey === "status"}
              direction="desc"
              onClick={() => toggleSort("status")}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {visibleReports.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title="No reports match"
          description="Try adjusting the filters or search term."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Team</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">
                  {report.reportNumber}
                </TableCell>
                <TableCell>{report.location}</TableCell>
                <TableCell className="text-muted-foreground">
                  {report.pollutionType}
                </TableCell>
                <TableCell>
                  <StatusBadge status={report.severity} variant="severity" />
                </TableCell>
                <TableCell>
                  <StatusBadge status={report.priority} variant="priority" />
                </TableCell>
                <TableCell>
                  <StatusBadge status={report.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {report.assignedTo ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(report.submittedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="xs"
                      render={<Link href={`/reports/${report.reportNumber}`} />}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openTriage(report)}
                    >
                      Triage
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openAssign(report)}
                    >
                      Assign
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={triageTarget !== null}
        onOpenChange={(open) => {
          if (!open) setTriageTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Triage Report</DialogTitle>
            <DialogDescription>
              Reclassify {triageTarget?.reportNumber ?? "report"} — severity,
              priority and operational status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select
                value={triageSeverity}
                onValueChange={handleTriageSeverityChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={triagePriority}
                onValueChange={(value) => setTriagePriority(String(value) as Priority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Low", "Medium", "High", "Urgent"] as Priority[]).map(
                    (priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={triageStatus}
                onValueChange={(value) => setTriageStatus(String(value) as ReportStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={confirmTriage}>Save Triage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={assignTarget !== null}
        onOpenChange={(open) => {
          if (!open) setAssignTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Team</DialogTitle>
            <DialogDescription>
              Assign {assignTarget?.reportNumber ?? "report"} to a field team.
              The report moves to &quot;assigned&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Team</Label>
            <Select value={assignTeam} onValueChange={(value) => setAssignTeam(String(value))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAMS.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={confirmAssign}>Assign Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string
  active: boolean
  direction: "asc" | "desc"
  onClick: () => void
}) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="xs"
      className="gap-1"
      onClick={onClick}
    >
      {label}
      {active ? (
        direction === "desc" ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUp className="h-3 w-3" />
        )
      ) : (
        <ChevronsUpDown className={cn("h-3 w-3 text-muted-foreground")} />
      )}
    </Button>
  )
}

export { ReportOperationsTable }