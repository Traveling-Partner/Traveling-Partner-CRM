"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AuditLogDetailDialog } from "@/components/audit-logs/AuditLogDetailDialog";
import { useAuditLogsQuery } from "@/hooks/queries/use-audit-logs-query";
import type { AuditLogRow } from "@/services/audit-logs";

const LAST_SEEN_KEY = "audit-log-header-last-seen";

function formatTime(value: string | null | undefined): string {
  const text = value?.trim();
  if (!text) return "";
  try {
    const d = parseISO(text);
    if (Number.isNaN(d.getTime())) return text;
    return format(d, "MMM d, HH:mm");
  } catch {
    return text;
  }
}

function readLastSeen(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(LAST_SEEN_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

function writeLastSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
}

/** Header bell — latest audit logs via existing GET /audit-logs/getAll. No new API. */
export function HeaderAuditLogBell() {
  const [lastSeen, setLastSeen] = useState(readLastSeen);
  const [selected, setSelected] = useState<AuditLogRow | null>(null);

  const { data, isLoading, refetch } = useAuditLogsQuery({
    page: 0,
    pageSize: 8,
    userType: "all",
    search: "",
    fromDate: "",
    toDate: "",
    module: "",
    action: "",
    userId: ""
  });

  const rows = data?.content ?? [];
  const unreadCount = useMemo(() => {
    if (!lastSeen) return rows.length;
    return rows.filter((row) => {
      const t = row.createdAt ? new Date(row.createdAt).getTime() : 0;
      return t > lastSeen;
    }).length;
  }, [rows, lastSeen]);

  const markSeen = () => {
    writeLastSeen();
    setLastSeen(Date.now());
  };

  return (
    <>
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          void refetch();
          markSeen();
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-lg" aria-label="Audit log notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Audit activity
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        {isLoading && rows.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">No audit logs yet.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto py-1">
            {rows.map((row) => (
              <DropdownMenuItem
                key={row.id}
                className="cursor-pointer items-start rounded-none border-b border-border/40 px-3 py-2 last:border-b-0"
                onSelect={() => setSelected(row)}
              >
                <div className="min-w-0">
                  <p className="line-clamp-2 text-xs text-foreground">
                    {row.description?.trim() || "—"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {[row.userType, formatTime(row.createdAt)].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem asChild className="cursor-pointer justify-center py-2 text-xs font-medium">
          <Link href="/admin/audit-logs">View all audit logs</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <AuditLogDetailDialog
      log={selected}
      onOpenChange={(open) => {
        if (!open) setSelected(null);
      }}
    />
    </>
  );
}
