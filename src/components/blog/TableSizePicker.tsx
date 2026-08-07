"use client";

import { useEffect, useRef, useState } from "react";
import { Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_ROWS = 10;
const MAX_COLS = 10;

export function TableSizePickerPanel({
  onInsert,
  onCancel
}: {
  onInsert: (rows: number, cols: number) => void;
  onCancel?: () => void;
}) {
  const [hover, setHover] = useState({ rows: 3, cols: 3 });

  return (
    <div className="w-[220px] rounded-xl border border-border/60 bg-popover p-3 shadow-premium-lg">
      <p className="mb-2 text-2xs font-medium text-muted-foreground">
        {hover.rows} × {hover.cols} table
      </p>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${MAX_COLS}, minmax(0, 1fr))` }}
        onMouseLeave={() => setHover({ rows: 1, cols: 1 })}
      >
        {Array.from({ length: MAX_ROWS * MAX_COLS }, (_, i) => {
          const row = Math.floor(i / MAX_COLS) + 1;
          const col = (i % MAX_COLS) + 1;
          const selected = row <= hover.rows && col <= hover.cols;
          return (
            <button
              key={i}
              type="button"
              className={cn(
                "h-4 w-4 rounded-[3px] border border-border/70 transition-colors",
                selected
                  ? "border-[#fdb813] bg-[var(--brand-light-active)]"
                  : "bg-background hover:bg-muted"
              )}
              onMouseEnter={() => setHover({ rows: row, cols: col })}
              onClick={() => onInsert(row, col)}
            />
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-2xs text-muted-foreground">Hover, then click</p>
        {onCancel ? (
          <button
            type="button"
            className="text-2xs text-muted-foreground hover:text-foreground"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}

interface TableSizePickerProps {
  onInsert: (rows: number, cols: number) => void;
  active?: boolean;
}

export function TableSizePicker({ onInsert, active }: TableSizePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Insert table"
        aria-label="Insert table"
        aria-expanded={open}
        className={cn(
          "h-8 w-8 shrink-0 rounded-lg text-muted-foreground",
          (active || open) && "bg-[var(--brand-light-active)] text-foreground"
        )}
        onClick={() => setOpen((o) => !o)}
      >
        <Table2 className="h-4 w-4" />
      </Button>

      {open ? (
        <div className="absolute left-0 top-9 z-40">
          <TableSizePickerPanel
            onInsert={(rows, cols) => {
              onInsert(rows, cols);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
