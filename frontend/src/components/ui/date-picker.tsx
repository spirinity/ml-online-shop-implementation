"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** Parse a YYYY-MM-DD string to a local Date (no timezone shift). */
function parseISO(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a Date to YYYY-MM-DD in local time. */
function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Latest selectable date as YYYY-MM-DD (inclusive). */
  max?: string;
  /** Earliest selectable date as YYYY-MM-DD (inclusive). */
  min?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Themed date picker that replaces the native browser date input so the calendar
 * matches the app design system. Built on the Base UI Popover primitive plus a
 * hand-rolled month grid (Base UI has no calendar component).
 */
export function DatePicker({
  id,
  value,
  onChange,
  max,
  min,
  disabled,
  placeholder = "Pilih tanggal",
  className,
}: DatePickerProps) {
  const selected = useMemo(() => parseISO(value), [value]);
  const maxDate = useMemo(() => (max ? parseISO(max) : null), [max]);
  const minDate = useMemo(() => (min ? parseISO(min) : null), [min]);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => selected ?? new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    // Convert Sunday-based getDay() to Monday-based index.
    const leading = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < leading; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: Array<Array<Date | null>> = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [year, month]);

  const isDisabledDay = (date: Date) => {
    const day = startOfDay(date);
    if (maxDate && day > startOfDay(maxDate)) return true;
    if (minDate && day < startOfDay(minDate)) return true;
    return false;
  };

  const displayLabel = selected
    ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(selected)
    : placeholder;

  const handleSelect = (date: Date) => {
    if (isDisabledDay(date)) return;
    onChange(toISO(date));
    setOpen(false);
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    if (!isDisabledDay(today)) {
      onChange(toISO(today));
      setOpen(false);
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        id={id}
        disabled={disabled}
        data-slot="date-picker-trigger"
        data-placeholder={selected ? undefined : ""}
        className={cn(
          "flex h-11 w-full items-center gap-2.5 rounded-full border border-input bg-background px-4 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground",
          className,
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className={cn("flex-1 truncate", selected ? "text-primary" : "text-muted-foreground")}>
          {displayLabel}
        </span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          collisionAvoidance={{ side: "flip", align: "shift" }}
          className="z-50"
        >
          <PopoverPrimitive.Popup
            data-slot="date-picker-popup"
            className="z-50 max-h-[var(--available-height)] w-[19rem] max-w-[calc(100vw-1.5rem)] origin-(--transform-origin) overflow-y-auto rounded-[var(--radius-card)] border border-border bg-popover p-3 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            <div className="flex items-center justify-between gap-2 px-1 pb-2">
              <strong className="text-sm font-semibold text-primary">
                {MONTHS[month]} {year}
              </strong>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-full text-muted-foreground"
                  aria-label="Bulan sebelumnya"
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-full text-muted-foreground"
                  aria-label="Bulan berikutnya"
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 px-1 pb-1">
              {WEEKDAYS.map((day) => (
                <span key={day} className="text-center text-xs font-medium text-muted-foreground">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 px-1">
              {weeks.flat().map((date, index) => {
                if (!date) return <span key={`empty-${index}`} aria-hidden="true" />;
                const disabledDay = isDisabledDay(date);
                const isSelected = selected ? isSameDay(date, selected) : false;
                const isToday = isSameDay(date, new Date());
                return (
                  <button
                    key={toISO(date)}
                    type="button"
                    disabled={disabledDay}
                    aria-pressed={isSelected}
                    onClick={() => handleSelect(date)}
                    className={cn(
                      "grid size-9 place-items-center rounded-full text-sm transition-colors",
                      "hover:bg-secondary hover:text-primary",
                      "disabled:pointer-events-none disabled:text-muted-foreground/40",
                      isSelected
                        ? "bg-primary font-semibold [color:var(--primary-foreground)] hover:bg-primary hover:[color:var(--primary-foreground)]"
                        : "text-primary",
                      !isSelected && isToday ? "ring-1 ring-accent" : null,
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border px-1 pt-2.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full text-sm text-accent"
                onClick={goToToday}
              >
                Hari ini
              </Button>
              <PopoverPrimitive.Close
                render={
                  <Button type="button" size="sm" variant="ghost" className="rounded-full text-sm text-muted-foreground">
                    Tutup
                  </Button>
                }
              />
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
