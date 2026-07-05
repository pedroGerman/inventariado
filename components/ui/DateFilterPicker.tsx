"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  MONTHS_FULL_ES,
  WEEKDAY_LABELS,
  buildCalendarDays,
  getDateFilterLabel,
  parseDateParts,
  toDateISO,
  type DateFilterValue,
} from "@/lib/utils/calendarPicker";
import {
  ffElevatedMetricSurfaceClass,
  liftedPopoverSurfaceClassName,
} from "@/lib/utils/ff-surfaces";
import { cn } from "@/lib/utils/cn";

type CalendarView = "year" | "month" | "day";

interface DateFilterPickerProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  className?: string;
}

export function DateFilterPicker({
  value,
  onChange,
  className,
}: DateFilterPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CalendarView>("day");
  const [displayYear, setDisplayYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());

  const displayLabel = getDateFilterLabel(value);

  useEffect(() => {
    if (!value) return;
    const parts = parseDateParts(value);
    setDisplayYear(parts.year);
    setSelectedMonth(parts.month);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  const calendarDays = useMemo(
    () => buildCalendarDays(displayYear, selectedMonth),
    [displayYear, selectedMonth],
  );

  function selectDay(day: number) {
    onChange(toDateISO(displayYear, selectedMonth, day));
    setOpen(false);
  }

  function clearFilter() {
    onChange(null);
    setOpen(false);
  }

  const headerTitle =
    view === "year"
      ? "Seleccionar año"
      : view === "month"
        ? String(displayYear)
        : MONTHS_FULL_ES[selectedMonth];

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          ffElevatedMetricSurfaceClass,
          "flex h-full min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-[box-shadow,transform] active:scale-[0.99]",
          open && "shadow-ff-surface-4",
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="truncate text-sm font-medium text-card-foreground">
          {displayLabel}
        </span>
        <Calendar className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div
          className={cn(
            liftedPopoverSurfaceClassName,
            "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-lg",
          )}
        >
          <button
            type="button"
            onClick={clearFilter}
            className={cn(
              "mb-4 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              value === null
                ? "bg-neutral-800 text-white"
                : "bg-neutral-100 text-neutral-800 active:bg-neutral-200",
            )}
          >
            Todo el tiempo
          </button>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (view === "year") {
                    setDisplayYear((y) => y - 1);
                    return;
                  }
                  if (view === "month") {
                    setDisplayYear((y) => y - 1);
                    return;
                  }
                  setSelectedMonth((m) => {
                    if (m === 0) {
                      setDisplayYear((y) => y - 1);
                      return 11;
                    }
                    return m - 1;
                  });
                }}
                className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 active:bg-slate-100"
                aria-label="Anterior"
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (view === "day") setView("month");
                  else if (view === "month") setView("year");
                }}
                disabled={view === "year"}
                className={cn(
                  "min-w-0 flex-1 truncate text-center text-sm font-semibold capitalize text-slate-900",
                  view !== "year" && "active:text-primary",
                )}
              >
                {headerTitle}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (view === "year") {
                    setDisplayYear((y) => y + 1);
                    return;
                  }
                  if (view === "month") {
                    setDisplayYear((y) => y + 1);
                    return;
                  }
                  setSelectedMonth((m) => {
                    if (m === 11) {
                      setDisplayYear((y) => y + 1);
                      return 0;
                    }
                    return m + 1;
                  });
                }}
                className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 active:bg-slate-100"
                aria-label="Siguiente"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {view === "year" ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 12 }, (_, index) => {
                  const year = displayYear - 5 + index;
                  const selected =
                    value != null && parseDateParts(value).year === year;
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setDisplayYear(year);
                        setView("month");
                      }}
                      className={cn(
                        "rounded-xl py-3 text-sm font-medium transition-colors",
                        selected
                          ? "bg-neutral-800 text-white"
                          : year === displayYear
                            ? "bg-slate-100 text-slate-900"
                            : "text-neutral-500 active:bg-neutral-100",
                      )}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {view === "month" ? (
              <div className="grid grid-cols-3 gap-2">
                {MONTHS_FULL_ES.map((monthLabel, monthIndex) => {
                  const selected =
                    value != null &&
                    parseDateParts(value).year === displayYear &&
                    parseDateParts(value).month === monthIndex;
                  return (
                    <button
                      key={monthLabel}
                      type="button"
                      onClick={() => {
                        setSelectedMonth(monthIndex);
                        setView("day");
                      }}
                      className={cn(
                        "rounded-xl py-3 text-sm font-medium capitalize transition-colors",
                        selected || selectedMonth === monthIndex
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-500 active:bg-neutral-100",
                      )}
                    >
                      {monthLabel.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {view === "day" ? (
              <div>
                <div className="mb-2 grid grid-cols-7 gap-1">
                  {WEEKDAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="py-1 text-center text-xs font-medium text-slate-400"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    if (day == null) {
                      return <div key={`empty-${index}`} className="h-10" />;
                    }

                    const isSelected =
                      value != null &&
                      value === toDateISO(displayYear, selectedMonth, day);
                    const isToday = (() => {
                      const now = new Date();
                      return (
                        now.getFullYear() === displayYear &&
                        now.getMonth() === selectedMonth &&
                        now.getDate() === day
                      );
                    })();

                    return (
                      <button
                        key={`${displayYear}-${selectedMonth}-${day}`}
                        type="button"
                        onClick={() => selectDay(day)}
                        className={cn(
                          "flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-colors",
                          isSelected
                            ? "bg-slate-900 text-white"
                            : isToday
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-900 active:bg-slate-100",
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
