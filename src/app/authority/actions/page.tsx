"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CheckCircle2, CircleDot, ListChecks, Route, Search, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { actions as initialActions } from "@/lib/demo-data/actions";
import { getZoneById } from "@/lib/demo-data/monitoring-zones";
import type { ActionStatus, Priority } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DemoBadge } from "@/components/shared/demo-badge";

const STATUSES: ActionStatus[] = ["planned", "assigned", "in_progress", "awaiting_verification", "completed"];
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Urgent"];
const TEAMS = ["Sanitation Team A", "Sanitation Team B", "Sanitation Team C", "Rapid Response", "Water Quality Unit", "Quality Assurance"];

const STATUS_ICON = {
  planned: CircleDot,
  assigned: Route,
  in_progress: Truck,
  awaiting_verification: BadgeCheck,
  completed: CheckCircle2,
} satisfies Record<ActionStatus, typeof CircleDot>;

export default function AuthorityActionsPage() {
  const [actions, setActions] = useState(initialActions);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return actions.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
      if (teamFilter !== "all" && a.assignedTeam !== teamFilter) return false;
      if (
        term &&
        !a.title.toLowerCase().includes(term) &&
        !a.description.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }, [actions, statusFilter, priorityFilter, teamFilter, search]);

  function advance(id: string) {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const order: ActionStatus[] = ["planned", "assigned", "in_progress", "awaiting_verification", "completed"];
        const idx = order.indexOf(a.status);
        return { ...a, status: order[Math.min(idx + 1, order.length - 1)] };
      })
    );
  }

  const stats = useMemo(() => {
    return STATUSES.map((s) => ({
      status: s,
      count: actions.filter((a) => a.status === s).length,
    }));
  }, [actions]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Button variant="ghost" size="sm" render={<Link href="/authority" />} className="mb-3 gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Command Center
        </Button>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0c1e3a] sm:text-3xl">
                Actions & Teams
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Monitor every cleanup action, advance its status and keep teams on track.
            </p>
          </div>
          <Button render={<Link href="/action-center" />} className="gap-2 shrink-0">
            <ListChecks className="h-4 w-4" />
            Open Action Center
          </Button>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {stats.map((s) => (
            <Card key={s.status} size="sm">
              <CardContent className="pt-2">
                <p className="text-xs font-medium text-slate-500">{s.status.replace(/_/g, " ")}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[#0c1e3a]">{s.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">All Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search title or description…"
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
                  icon={<Search className="h-5 w-5" />}
                  title="No actions match"
                  description="Try adjusting the filters."
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
                      <TableHead className="text-right">Advance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((action) => {
                      const Icon = STATUS_ICON[action.status];
                      const zone = getZoneById(action.zoneId);
                      const reachedEnd = action.status === "completed";
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
                          <TableCell className="text-xs text-slate-600">{zone?.name ?? action.zoneId}</TableCell>
                          <TableCell>
                            <StatusBadge status={action.priority} variant="priority" />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={action.status} />
                          </TableCell>
                          <TableCell className="text-xs">{action.assignedTeam}</TableCell>
                          <TableCell className="hidden text-xs md:table-cell">{action.dueDate}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="xs"
                              disabled={reachedEnd}
                              onClick={() => advance(action.id)}
                            >
                              {action.status === "in_progress"
                                ? "Mark for Verification"
                                : reachedEnd
                                  ? "Done"
                                  : `Move to ${["assigned", "in_progress", "awaiting_verification", "completed"][["planned", "assigned", "in_progress", "awaiting_verification"].indexOf(action.status)] ?? "…"} →`}
                            </Button>
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
    </div>
  );
}