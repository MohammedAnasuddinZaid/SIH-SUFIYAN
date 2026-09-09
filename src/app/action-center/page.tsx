"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  ClipboardPlus,
  Filter,
  ListChecks,
  CircleDot,
  Route,
  Search,
  Truck,
  CalendarDays,
  Plus,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { actions as initialActions, getActionsByStatus } from "@/lib/demo-data/actions";
import { pollutionReports } from "@/lib/demo-data/reports";
import { getZoneById } from "@/lib/demo-data/monitoring-zones";
import type { Action, ActionStatus, Priority } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DemoBadge } from "@/components/shared/demo-badge";

const STATUSES: ActionStatus[] = ["planned", "assigned", "in_progress", "awaiting_verification", "completed"];
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Urgent"];
const TEAMS = ["Sanitation Team A", "Sanitation Team B", "Sanitation Team C", "Rapid Response", "Water Quality Unit", "Quality Assurance"];

const STATUS_ICON: Record<ActionStatus, typeof Plus> = {
  planned: CircleDot,
  assigned: Route,
  in_progress: Truck,
  awaiting_verification: BadgeCheck,
  completed: CheckCircle2,
};

function emptyActionForm(): Omit<Action, "id"> {
  return {
    title: "",
    description: "",
    priority: "Medium",
    status: "planned",
    dueDate: "2026-09-15",
    assignedTeam: TEAMS[0],
    zoneId: "zone-musi-04",
  };
}

function ActionCenterInner() {
  const [actions, setActions] = useState(initialActions);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyActionForm());
  const [viewId, setViewId] = useState<string | null>(null);

  const counts = useMemo(() => {
    return {
      planned: getActionsByStatus("planned").length,
      assigned: getActionsByStatus("assigned").length,
      in_progress: getActionsByStatus("in_progress").length,
      awaiting_verification: getActionsByStatus("awaiting_verification").length,
      completed: getActionsByStatus("completed").length,
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return actions.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
      if (teamFilter !== "all" && a.assignedTeam !== teamFilter) return false;
      if (
        term &&
        !a.title.toLowerCase().includes(term) &&
        !a.description.toLowerCase().includes(term) &&
        !a.zoneId.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }, [actions, statusFilter, priorityFilter, teamFilter, search]);

  function handleTriageAction(id: string, status: ActionStatus) {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function handleCreate() {
    const nextId = `act-${String(actions.length + 1).padStart(3, "0")}`;
    setActions((prev) => [
      { ...form, id: nextId, title: form.title.trim() || "Untitled action" },
      ...prev,
    ]);
    setDialogOpen(false);
    setForm(emptyActionForm());
  }

  const viewedAction = viewId ? actions.find((a) => a.id === viewId) ?? null : null;
  const viewedReport = viewedAction
    ? pollutionReports.find((r) => r.id === viewedAction.relatedReportId)
    : null;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                Action Center
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Plan, assign and track sanitation actions from AI recommendations
              and verified pollution reports.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Action
          </Button>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard title="Planned" value={counts.planned} icon={<CircleDot className="h-4 w-4" />} description="Ready to schedule" />
          <MetricCard title="Assigned" value={counts.assigned} icon={<Route className="h-4 w-4" />} description="Assigned to a team" />
          <MetricCard title="In Progress" value={counts.in_progress} icon={<Truck className="h-4 w-4" />} description="Teams on site" />
          <MetricCard title="Awaiting Verification" value={counts.awaiting_verification} icon={<BadgeCheck className="h-4 w-4" />} description="Pending checks" />
          <MetricCard title="Completed" value={counts.completed} icon={<CheckCircle2 className="h-4 w-4" />} description="Operationally done" />
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Actions ({filtered.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search title, description, zone…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                  <SelectTrigger className="w-44" aria-label="Filter by status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? "all")}>
                  <SelectTrigger className="w-36" aria-label="Filter by priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priority</SelectItem>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={teamFilter} onValueChange={(v) => setTeamFilter(v ?? "all")}>
                  <SelectTrigger className="w-48" aria-label="Filter by team">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All teams</SelectItem>
                    {TEAMS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={<Filter className="h-5 w-5" />}
                  title="No actions match"
                  description="Try adjusting the filters or create a new action."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="hidden md:table-cell">Due</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((action) => {
                      const Icon = STATUS_ICON[action.status];
                      const zone = getZoneById(action.zoneId);
                      return (
                        <TableRow key={action.id}>
                          <TableCell>
                            <div className="flex items-start gap-2.5">
                              <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground")}>
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium">{action.title}</p>
                                <p className="truncate text-xs text-muted-foreground">{action.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {zone?.name ?? action.zoneId}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={action.priority} variant="priority" />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={action.status} />
                          </TableCell>
                          <TableCell className="text-xs">{action.assignedTeam}</TableCell>
                          <TableCell className="hidden text-xs md:table-cell">{action.dueDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1.5">
                              <Button variant="outline" size="xs" onClick={() => setViewId(action.id)}>
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Button>
                              {action.status === "planned" && (
                                <Button variant="outline" size="xs" onClick={() => handleTriageAction(action.id, "assigned")}>
                                  Assign
                                </Button>
                              )}
                              {action.status === "in_progress" && (
                                <Button variant="outline" size="xs" onClick={() => handleTriageAction(action.id, "awaiting_verification")}>
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Action</DialogTitle>
            <DialogDescription>
              Create a sanitation or investigation action from a recommendation or report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="action-title">Title</Label>
              <Input
                id="action-title"
                placeholder="e.g. Zone 04 daily plastic cleanup"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="action-desc">Description</Label>
              <Input
                id="action-desc"
                placeholder="Short description of the work to be done"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Zone</Label>
                <Select value={form.zoneId} onValueChange={(v) => setForm({ ...form, zoneId: v ?? "zone-musi-04" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["zone-musi-01", "zone-musi-02", "zone-musi-03", "zone-musi-04", "zone-musi-05", "zone-musi-06", "zone-musi-07", "zone-musi-08", "zone-musi-09", "zone-musi-10", "zone-musi-11", "zone-musi-12"].map((z) => (
                      <SelectItem key={z} value={z}>
                        {getZoneById(z)?.name ?? z}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: (v ?? "Medium") as Priority })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Assigned Team</Label>
                <Select value={form.assignedTeam} onValueChange={(v) => setForm({ ...form, assignedTeam: v ?? TEAMS[0] })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAMS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Initial Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: (v ?? "planned") as ActionStatus })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="action-due">Due Date</Label>
              <Input
                id="action-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleCreate} className="gap-2">
              <ClipboardPlus className="h-4 w-4" />
              Create Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewedAction !== null} onOpenChange={(open) => { if (!open) setViewId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Action Details</DialogTitle>
            <DialogDescription>
              {viewedAction?.id}
            </DialogDescription>
          </DialogHeader>
          {viewedAction && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">{viewedAction.title}</p>
                <p className="mt-1 text-muted-foreground">{viewedAction.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <p className="mt-1">
                    <StatusBadge status={viewedAction.priority} variant="priority" />
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="mt-1">
                    <StatusBadge status={viewedAction.status} />
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Team</p>
                  <p className="mt-0.5 font-medium">{viewedAction.assignedTeam}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-medium">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {viewedAction.dueDate}
                  </p>
                </div>
              </div>
              {viewedReport && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
                  <p className="font-semibold">Linked report</p>
                  <p className="mt-0.5">
                    {viewedReport.reportNumber} — {viewedReport.location}
                  </p>
                  <Link href={`/reports/${viewedReport.reportNumber}`} className="mt-1 inline-block font-medium text-blue-700 hover:underline">
                    View report →
                  </Link>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Changes made in this screen are local to the demo session.
              </p>
            </div>
          )}
          <DialogFooter showCloseButton>
            <Button render={<Link href="/waste-management" />}>
              Open Waste Management
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ActionCenterPage() {
  return <ActionCenterInner />;
}