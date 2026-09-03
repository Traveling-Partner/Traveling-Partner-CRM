"use client";

import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { AuditLogRow } from "@/services/audit-logs";

function formatTimestamp(value: string | null | undefined): string {
  const text = value?.trim();
  if (!text) return "—";
  try {
    const d = parseISO(text);
    if (Number.isNaN(d.getTime())) return text;
    return format(d, "MMM d, yyyy HH:mm");
  } catch {
    return text;
  }
}

export function auditLogSearchHref(log: AuditLogRow): string {
  const params = new URLSearchParams();
  const q = (log.description ?? "").trim().slice(0, 80);
  if (q) params.set("search", q);
  if (log.id != null) params.set("highlightId", String(log.id));
  const qs = params.toString();
  return qs ? `/admin/audit-logs?${qs}` : "/admin/audit-logs";
}

interface AuditLogDetailDialogProps {
  log: AuditLogRow | null;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailDialog({ log, onOpenChange }: AuditLogDetailDialogProps) {
  const router = useRouter();

  const handleFind = () => {
    if (!log) return;
    const href = auditLogSearchHref(log);
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={Boolean(log)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-light)]">
            <ScrollText className="h-5 w-5 text-foreground" />
          </div>
          <DialogTitle>Audit log</DialogTitle>
          <DialogDescription>Details for this activity.</DialogDescription>
        </DialogHeader>

        {log ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                What happened
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {log.description?.trim() || "—"}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-border/50 px-3 py-2">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  User type
                </dt>
                <dd className="mt-0.5 font-medium">{log.userType?.trim() || "—"}</dd>
              </div>
              <div className="rounded-lg border border-border/50 px-3 py-2">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Mobile
                </dt>
                <dd className="mt-0.5 font-medium">{log.mobileNumber?.trim() || "—"}</dd>
              </div>
              <div className="col-span-2 rounded-lg border border-border/50 px-3 py-2">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Time
                </dt>
                <dd className="mt-0.5 font-medium tabular-nums">{formatTimestamp(log.createdAt)}</dd>
              </div>
              {log.id != null ? (
                <div className="col-span-2 rounded-lg border border-border/50 px-3 py-2">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Log ID
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums">{log.id}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {log ? (
            <Button type="button" onClick={handleFind}>
              Find in audit logs
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
