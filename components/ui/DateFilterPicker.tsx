"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  MONTHS_FULL_ES,
  WEEKDAY_LABELS,
  buildCalendarDays,
  getDateFilterAnchor,
  getDateFilterLabel,
  getDraftRangePosition,
  normalizeRange,
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
  const [draftStart, setDraftStart] = useState<string | null>(null);
  const [draftEnd, setDraftEnd] = useState<string | null>(null);

  const displayLabel = getDateFilterLabel(value);

  function syncDraftFromValue() {
    if (!value) {
      setDraftStart(null);
      setDraftEnd(null);
      return;
    }
    if (value.kind === "day") {
      setDraftStart(value.date);
      setDraftEnd(value.date);
      return;
    }
    const { start, end } = normalizeRange(value.start, value.end);
    setDraftStart(start);
    setDraftEnd(end);
  }

  useEffect(() => {
    const anchor = getDateFilterAnchor(value);
    if (!anchor) return;
    const parts = parseDateParts(anchor);
    setDisplayYear(parts.year);
    setSelectedMonth(parts.month);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    setView("day");
    syncDraftFromValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  function handleDayClick(day: number) {
    const date = toDateISO(displayYear, selectedMonth, day);

    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(date);
      setDraftEnd(null);
      return;
    }

    if (date < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(date);
      return;
    }

    setDraftEnd(date);
  }

  function applyDraft() {
    if (!draftStart) return;
    const { start, end } = normalizeRange(draftStart, draftEnd ?? draftStart);
    onChange(
      start === end
        ? { kind: "day", date: start }
        : { kind: "range", start, end },
    );
    setOpen(false);
  }

  function clearFilter() {
    setDraftStart(null);
    setDraftEnd(null);
    onChange(null);
    setOpen(false);
  }

  const headerTitle =
    view === "year"
      ? "Seleccionar año"
      : view === "month"
        ? String(displayYear)
        : MONTHS_FULL_ES[selectedMonth];

  const canApply = draftStart != null;

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
                  const anchor = getDateFilterAnchor(value);
                  const selected =
                    anchor != null && parseDateParts(anchor).year === year;
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
                {MONTHS_FULL_ES.map((monthLabel, monthIndex) => (
                  <button
                    key={monthLabel}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(monthIndex);
                      setView("day");
                    }}
                    className={cn(
                      "rounded-xl py-3 text-sm font-medium capitalize transition-colors",
                      selectedMonth === monthIndex
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-500 active:bg-neutral-100",
                    )}
                  >
                    {monthLabel.slice(0, 3)}
                  </button>
                ))}
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

                    const dateISO = toDateISO(displayYear, selectedMonth, day);
                    const rangePosition = getDraftRangePosition(
                      dateISO,
                      draftStart,
                      draftEnd,
                    );
                    const isRangeStart = rangePosition === "start";
                    const isRangeEnd = rangePosition === "end";
                    const isRangeMiddle = rangePosition === "middle";
                    const isRangeEndpoint = isRangeStart || isRangeEnd;
                    const hasDistinctRange =
                      draftStart != null &&
                      draftEnd != null &&
                      draftStart !== draftEnd;
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
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          "flex h-10 items-center justify-center text-sm font-medium transition-colors",
                          isRangeEndpoint
                            ? "bg-slate-900 text-white"
                            : isRangeMiddle
                              ? "bg-slate-100 text-slate-900"
                              : isToday
                                ? "rounded-xl bg-slate-100 text-slate-900"
                                : "rounded-xl text-slate-900 active:bg-slate-100",
                          hasDistinctRange &&
                            isRangeStart &&
                            "rounded-l-xl rounded-r-none",
                          hasDistinctRange &&
                            isRangeEnd &&
                            "rounded-l-none rounded-r-xl",
                          isRangeEndpoint && !hasDistinctRange && "rounded-xl",
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 !rounded-lg !py-5"
                    onClick={() => {
                      setDraftStart(null);
                      setDraftEnd(null);
                    }}
                    disabled={!draftStart}
                  >
                    Limpiar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1 !rounded-lg !py-5"
                    onClick={applyDraft}
                    disabled={!canApply}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
