"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  DASHBOARD_PERIOD_PRESETS,
  getDashboardPeriodLabel,
  isPresetSelected,
  MONTHS_FULL_ES,
  type DashboardPeriodFilter,
  type DashboardPeriodPresetId,
} from "@/lib/utils/dashboardPeriod";
import {
  ffElevatedMetricSurfaceClass,
  liftedPopoverSurfaceClassName,
} from "@/lib/utils/ff-surfaces";
import { cn } from "@/lib/utils/cn";

type PickerTab = "preset" | "calendar";
type CalendarView = "month" | "day";

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

interface DashboardPeriodPickerProps {
  value: DashboardPeriodFilter;
  onChange: (value: DashboardPeriodFilter) => void;
  className?: string;
}

function parseDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month: month - 1, day };
}

function toDateISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function startWeekdayMonday(year: number, month: number) {
  const weekday = new Date(year, month, 1).getDay();
  return weekday === 0 ? 6 : weekday - 1;
}

export function DashboardPeriodPicker({
  value,
  onChange,
  className,
}: DashboardPeriodPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PickerTab>("preset");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const currentYear = new Date().getFullYear();

  const displayLabel = getDashboardPeriodLabel(value);

  useEffect(() => {
    if (value.kind === "day") {
      const parts = parseDateParts(value.date);
      setSelectedMonth(parts.month);
    }
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

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(currentYear, selectedMonth);
    const leading = startWeekdayMonday(currentYear, selectedMonth);
    const cells: Array<number | null> = [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: totalDays }, (_, index) => index + 1),
    ];

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [currentYear, selectedMonth]);

  function selectPreset(preset: DashboardPeriodPresetId) {
    onChange({ kind: "preset", preset });
    setOpen(false);
  }

  function selectDay(day: number) {
    const date = toDateISO(currentYear, selectedMonth, day);
    onChange({ kind: "day", date });
    setOpen(false);
  }

  function openCalendarTab() {
    setTab("calendar");
    setCalendarView("month");
  }

  function goToPreviousMonth() {
    setSelectedMonth((current) => (current === 0 ? 11 : current - 1));
  }

  function goToNextMonth() {
    setSelectedMonth((current) => (current === 11 ? 0 : current + 1));
  }

  const calendarTitle =
    calendarView === "month"
      ? String(currentYear)
      : MONTHS_FULL_ES[selectedMonth];

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          ffElevatedMetricSurfaceClass,
          "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-[box-shadow,transform] hover:shadow-ff-surface-4 active:scale-[0.99]",
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
          <SegmentedControl
            value={tab}
            onChange={(next) => {
              setTab(next);
              if (next === "calendar") openCalendarTab();
            }}
            options={[
              { value: "preset", label: "Período" },
              { value: "calendar", label: "Calendario" },
            ]}
            aria-label="Tipo de selector de fecha"
            className="mb-4"
          />

          {tab === "preset" ? (
            <div className="flex flex-wrap gap-2">
              {DASHBOARD_PERIOD_PRESETS.map((preset) => {
                const selected = isPresetSelected(value, preset.id);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset.id)}
                    className={cn(
                      "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "bg-neutral-800 text-white"
                        : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (calendarView === "day") {
                      goToPreviousMonth();
                      return;
                    }
                  }}
                  disabled={calendarView === "month"}
                  className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (calendarView === "day") {
                      setCalendarView("month");
                    }
                  }}
                  disabled={calendarView === "month"}
                  className={cn(
                    "min-w-0 flex-1 truncate text-center text-sm font-semibold capitalize text-slate-900",
                    calendarView === "day" && "hover:text-primary",
                  )}
                >
                  {calendarTitle}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (calendarView === "day") {
                      goToNextMonth();
                    }
                  }}
                  disabled={calendarView === "month"}
                  className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {calendarView === "month" ? (
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS_FULL_ES.map((monthLabel, monthIndex) => {
                    const selected =
                      value.kind === "day" &&
                      parseDateParts(value.date).year === currentYear &&
                      parseDateParts(value.date).month === monthIndex;
                    return (
                      <button
                        key={monthLabel}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(monthIndex);
                          setCalendarView("day");
                        }}
                        className={cn(
                          "rounded-xl py-3 text-sm font-medium capitalize transition-colors",
                          selected || selectedMonth === monthIndex
                            ? "bg-neutral-800 text-white"
                            : "text-neutral-500 hover:bg-neutral-100",
                        )}
                      >
                        {monthLabel.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {calendarView === "day" ? (
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
                        value.kind === "day" &&
                        value.date === toDateISO(currentYear, selectedMonth, day);
                      const isToday =
                        (() => {
                          const now = new Date();
                          return (
                            now.getFullYear() === currentYear &&
                            now.getMonth() === selectedMonth &&
                            now.getDate() === day
                          );
                        })();

                      return (
                        <button
                          key={`${currentYear}-${selectedMonth}-${day}`}
                          type="button"
                          onClick={() => selectDay(day)}
                          className={cn(
                            "flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-colors",
                            isSelected
                              ? "bg-slate-900 text-white"
                              : isToday
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-900 hover:bg-slate-100",
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
          )}
        </div>
      ) : null}
    </div>
  );
}
