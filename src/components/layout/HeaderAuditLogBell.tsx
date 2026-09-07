"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Bell, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-[#fce001] to-[#fdb813] px-1 text-[10px] font-bold leading-none text-foreground shadow-sm ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] overflow-hidden p-0">
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#fce001] to-[#fdb813] px-3.5 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/25">
            <Bell className="h-4 w-4 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Audit activity</p>
            <p className="text-[11px] text-foreground/70">Latest CRM actions</p>
          </div>
        </div>
        {isLoading && rows.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">No audit logs yet.</p>
        ) : (
          <div className="max-h-80 space-y-1 overflow-y-auto p-2">
            {rows.map((row) => (
              <DropdownMenuItem
                key={row.id}
                className="cursor-pointer items-start gap-2.5 rounded-lg border border-transparent px-2.5 py-2.5 focus:border-[#fdb813]/30 focus:bg-[var(--brand-light)]"
                onSelect={() => setSelected(row)}
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#fce001]/70 to-[#fdb813]/80">
                  <ScrollText className="h-3.5 w-3.5 text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs leading-snug text-foreground">
                    {row.description?.trim() || "—"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {row.userType ? (
                      <span className="rounded-full bg-[var(--brand-light)] px-1.5 py-px text-[10px] font-medium text-foreground">
                        {row.userType}
                      </span>
                    ) : null}
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(row.createdAt)}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem asChild className="cursor-pointer justify-center rounded-none py-2.5 text-xs font-semibold text-foreground focus:bg-[var(--brand-light)]">
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
