"use client";

import * as React from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  parse,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
] as const;

function toDateOnly(value: string): string {
  return value.trim().slice(0, 10);
}

function toTimePart(value: string): string {
  const match = value.trim().match(/T(\d{2}:\d{2})/);
  return match?.[1] ?? "00:00";
}

function parseBound(value?: string): Date | null {
  if (!value) return null;
  const date = parseISO(toDateOnly(value));
  return isValid(date) ? date : null;
}

function parseSelected(value: string): Date | null {
  const datePart = toDateOnly(value);
  if (!datePart) return null;
  const date = parse(datePart, "yyyy-MM-dd", new Date());
  return isValid(date) ? date : null;
}

function monthCells(viewDate: Date): Date[] {
  const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 });
  const days: Date[] = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

function emitChange(
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined,
  input: HTMLInputElement | null,
  next: string
) {
  if (input) input.value = next;
  onChange?.({
    target: input ?? { value: next },
    currentTarget: input ?? { value: next }
  } as React.ChangeEvent<HTMLInputElement>);
}

function formatDisplay(raw: string, isDateTime: boolean): string {
  const selected = parseSelected(raw);
  if (!selected) return "";
  try {
    if (isDateTime) {
      const withTime = parseISO(`${toDateOnly(raw)}T${toTimePart(raw)}`);
      return isValid(withTime) ? format(withTime, "MMM d, yyyy HH:mm") : format(selected, "MMM d, yyyy");
    }
    return format(selected, "MMM d, yyyy");
  } catch {
    return format(selected, "MMM d, yyyy");
  }
}

export interface DatePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const DatePickerInput = React.forwardRef<HTMLInputElement, DatePickerInputProps>(
  (
    {
      className,
      type = "date",
      value,
      defaultValue,
      onChange,
      onBlur,
      disabled,
      readOnly,
      min,
      max,
      placeholder,
      id,
      name,
      required,
      "aria-label": ariaLabel
    },
    ref
  ) => {
    const isDateTime = type === "datetime-local";
    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState(
      String(defaultValue ?? "")
    );
    const current = isControlled ? String(value ?? "") : uncontrolled;
    const selected = parseSelected(current);
    const minDate = parseBound(typeof min === "string" ? min : undefined);
    const maxDate = parseBound(typeof max === "string" ? max : undefined);

    const [open, setOpen] = React.useState(false);
    const [viewDate, setViewDate] = React.useState(() => selected ?? new Date());
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const assignRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    React.useEffect(() => {
      const node = inputRef.current;
      if (node && !isControlled && node.value) {
        setUncontrolled((prev) => prev || node.value);
      }
    }, [isControlled]);

    React.useEffect(() => {
      const next = parseSelected(current);
      if (next) setViewDate(next);
    }, [current]);

    const setValue = (next: string) => {
      if (!isControlled) setUncontrolled(next);
      emitChange(onChange, inputRef.current, next);
    };

    const applyDate = (day: Date) => {
      const datePart = format(day, "yyyy-MM-dd");
      if (isDateTime) {
        setValue(`${datePart}T${toTimePart(current)}`);
      } else {
        setValue(datePart);
        setOpen(false);
      }
    };

    const applyTime = (time: string) => {
      const datePart = toDateOnly(current) || format(new Date(), "yyyy-MM-dd");
      setValue(`${datePart}T${time || "00:00"}`);
    };

    const isDisabledDay = (day: Date) => {
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      if (minDate && dayStart < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
        return true;
      }
      if (maxDate && dayStart > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) {
        return true;
      }
      return false;
    };

    const year = viewDate.getFullYear();
    const yearStart = Math.min(year - 40, minDate?.getFullYear() ?? year - 40);
    const yearEnd = Math.max(year + 10, maxDate?.getFullYear() ?? year + 10);
    const years: number[] = [];
    for (let y = yearStart; y <= yearEnd; y += 1) years.push(y);

    const display = formatDisplay(current, isDateTime);
    const cells = monthCells(viewDate);

    return (
      <>
        <input
          ref={assignRef}
          type="text"
          name={name}
          required={required}
          disabled={disabled}
          {...(isControlled
            ? { value: current }
            : { defaultValue: String(defaultValue ?? "") })}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          onChange={() => undefined}
          onBlur={onBlur}
        />
        <Popover
          open={open}
          onOpenChange={(next) => {
            if (disabled || readOnly) return;
            setOpen(next);
            if (!next) {
              onBlur?.({
                target: inputRef.current
              } as React.FocusEvent<HTMLInputElement>);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              id={id}
              type="button"
              disabled={disabled}
              aria-label={ariaLabel ?? (isDateTime ? "Choose date and time" : "Choose date")}
              className={cn(
                "flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground ring-offset-background transition-colors duration-200",
                "hover:border-border/80",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-focus-ring)] focus-visible:border-[#fdb813]/40",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
                open && "border-[#fdb813]/40 ring-2 ring-[var(--brand-focus-ring)]",
                className
              )}
            >
              <span className={cn("min-w-0 flex-1 truncate", !display && "text-muted-foreground/70")}>
                {display || placeholder || (isDateTime ? "Select date & time" : "Select date")}
              </span>
              <CalendarDays className="h-4 w-4 shrink-0 text-[#fdb813]" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[18.5rem] overflow-hidden p-0" align="start">
            <div className="flex items-center gap-1 bg-gradient-to-r from-[#fce001] to-[#fdb813] px-2.5 py-2.5">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-foreground hover:bg-background/25"
                onClick={() => setViewDate((d) => addMonths(d, -1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
                <select
                  aria-label="Month"
                  className="max-w-[7.5rem] cursor-pointer truncate rounded-md bg-background/20 px-1.5 py-1 text-xs font-semibold text-foreground outline-none hover:bg-background/30"
                  value={viewDate.getMonth()}
                  onChange={(e) => {
                    const month = Number(e.target.value);
                    setViewDate((d) => new Date(d.getFullYear(), month, 1));
                  }}
                >
                  {MONTHS.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Year"
                  className="cursor-pointer rounded-md bg-background/20 px-1.5 py-1 text-xs font-semibold text-foreground outline-none hover:bg-background/30"
                  value={viewDate.getFullYear()}
                  onChange={(e) => {
                    const nextYear = Number(e.target.value);
                    setViewDate((d) => new Date(nextYear, d.getMonth(), 1));
                  }}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-foreground hover:bg-background/25"
                onClick={() => setViewDate((d) => addMonths(d, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="px-2.5 pb-2 pt-2">
              <div className="mb-1 grid grid-cols-7">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day) => {
                  const inMonth = isSameMonth(day, viewDate);
                  const selectedDay = selected ? isSameDay(day, selected) : false;
                  const today = isToday(day);
                  const dayDisabled = isDisabledDay(day);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={dayDisabled}
                      onClick={() => applyDate(day)}
                      className={cn(
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                        !inMonth && "text-muted-foreground/40",
                        inMonth && !selectedDay && "text-foreground hover:bg-[var(--brand-light-hover)]",
                        today && !selectedDay && "ring-1 ring-[#fdb813]/80",
                        selectedDay &&
                          "bg-gradient-to-br from-[#fce001] to-[#fdb813] font-semibold text-foreground shadow-sm hover:from-[#fce001] hover:to-[#fdb813]",
                        dayDisabled && "cursor-not-allowed opacity-30 hover:bg-transparent"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>

            {isDateTime ? (
              <div className="border-t border-border/60 px-3 py-2">
                <label className="flex items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground">
                  Time
                  <input
                    type="time"
                    value={toTimePart(current)}
                    onChange={(e) => applyTime(e.target.value)}
                    className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-[#fdb813]/40 focus:ring-2 focus:ring-[var(--brand-focus-ring)]"
                  />
                </label>
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-border/60 bg-[var(--brand-light)] px-2.5 py-1.5">
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs font-semibold text-foreground hover:bg-background/70"
                onClick={() => {
                  setValue("");
                  setOpen(false);
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="rounded-md bg-gradient-to-r from-[#fce001] to-[#fdb813] px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm hover:brightness-[1.03]"
                onClick={() => {
                  const now = new Date();
                  if (isDateTime) {
                    setValue(format(now, "yyyy-MM-dd'T'HH:mm"));
                  } else {
                    applyDate(now);
                  }
                  setViewDate(now);
                }}
              >
                Today
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </>
    );
  }
);

DatePickerInput.displayName = "DatePickerInput";
