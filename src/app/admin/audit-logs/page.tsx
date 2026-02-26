"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { auditLogs } from "@/mock-data/audit-logs";
import { allUsers } from "@/mock-data/users";
import type { AuditLog } from "@/types/domain";

const PAGE_SIZE = 15;
const actions = Array.from(new Set(auditLogs.map((a) => a.action)));
const entityTypes = Array.from(new Set(auditLogs.map((a) => a.entityType)));

type Row = AuditLog & { actorName: string };

export default function AdminAuditLogsPage() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const rows: Row[] = useMemo(
    () =>
      auditLogs.map((log) => ({
        ...log,
        actorName: allUsers.find((u) => u.id === log.actorId)?.name ?? log.actorId
      })),
    []
  );

  const filtered = useMemo(
    () =>
      rows.filter((log) => {
        const matchAction = actionFilter === "all" || log.action === actionFilter;
        const matchActor = actorFilter === "all" || log.actorId === actorFilter;
        const matchEntity = entityFilter === "all" || log.entityType === entityFilter;
        return matchAction && matchActor && matchEntity;
      }),
    [rows, actionFilter, actorFilter, entityFilter]
  );

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const columns: ColumnDef<Row>[] = [
    { accessorKey: "action", header: "Action" },
    { accessorKey: "actorName", header: "Actor" },
    { accessorKey: "entityType", header: "Entity type" },
    { accessorKey: "entityId", header: "Entity ID" },
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString()
    }
  ];

  return (
    <AppShell title="Audit Logs">
      <PageContainer>
        <SectionCard
          title="Audit logs"
          description="Enterprise activity log. Filter by action, actor, or entity type."
        >
          <div className="flex flex-wrap gap-2 pb-4">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actorFilter} onValueChange={(v) => { setActorFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Actor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actors</SelectItem>
                {allUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(0); }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {entityTypes.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={paginated} />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {paginated.length ? page * PAGE_SIZE + 1 : 0} – {page * PAGE_SIZE + paginated.length} of {filtered.length}</span>
            <div className="flex gap-1">
              <button
                type="button"
                className="rounded border border-border/60 bg-background px-2 py-1 text-xs disabled:opacity-50"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span>Page {page + 1} of {totalPages}</span>
              <button
                type="button"
                className="rounded border border-border/60 bg-background px-2 py-1 text-xs disabled:opacity-50"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
