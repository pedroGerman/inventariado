"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Filter, X } from "lucide-react";
import {
  getStatusFilterLabel,
  getStatusFilterOptions,
  type OrderListTab,
  type StatusFilterOption,
} from "@/lib/utils/orderStatusFilter";
import {
  ffElevatedMetricSurfaceClass,
  liftedPopoverSurfaceClassName,
} from "@/lib/utils/ff-surfaces";
import { cn } from "@/lib/utils/cn";

interface OrderStatusFilterProps {
  tab: OrderListTab;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

function toggleValue(selected: Set<string>, value: string): Set<string> {
  const next = new Set(selected);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function OrderStatusFilterButton({
  tab,
  selected,
  onChange,
}: OrderStatusFilterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const options = getStatusFilterOptions(tab);
  const hasActiveFilters = selected.size > 0;

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

  function clearAll() {
    onChange(new Set());
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative shrink-0 self-stretch">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Filtrar por estado"
        aria-expanded={open}
        className={cn(
          ffElevatedMetricSurfaceClass,
          "flex h-full min-h-12 w-12 items-center justify-center transition-[box-shadow,transform] active:scale-[0.98]",
          hasActiveFilters
            ? "text-foreground shadow-ff-surface-4"
            : "text-muted-foreground",
          open && "shadow-ff-surface-4",
        )}
      >
        <Filter className="size-4" strokeWidth={2} />
      </button>

      {open ? (
        <div
          className={cn(
            liftedPopoverSurfaceClassName,
            "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/70 bg-white p-1 shadow-lg",
          )}
        >
          <div className="border-b border-border/40 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">Estado</p>
          </div>

          <div className="flex max-h-[min(16rem,50dvh)] flex-col gap-0.5 overflow-y-auto p-1">
            {options.map((option) => (
              <StatusFilterOptionRow
                key={option.value}
                option={option}
                active={selected.has(option.value)}
                onToggle={() => onChange(toggleValue(selected, option.value))}
              />
            ))}
          </div>

          {hasActiveFilters ? (
            <div className="border-t border-border/40 p-1">
              <button
                type="button"
                onClick={clearAll}
                className="flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                Limpiar filtros
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function OrderStatusFilterPills({
  tab,
  selected,
  onChange,
}: OrderStatusFilterProps) {
  if (selected.size === 0) return null;

  function clearAll() {
    onChange(new Set());
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Array.from(selected).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(toggleValue(selected, value))}
          className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-warning transition-colors hover:bg-orange-200/80"
        >
          {getStatusFilterLabel(value, tab)}
          <X className="size-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        aria-label="Limpiar filtros de estado"
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function StatusFilterOptionRow({
  option,
  active,
  onToggle,
}: {
  option: StatusFilterOption;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
        active
          ? "bg-surface-2 text-card-foreground"
          : "text-card-foreground hover:bg-surface-2",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{option.label}</span>
      {active ? <Check className="size-4 shrink-0 text-primary" strokeWidth={2.5} /> : null}
    </button>
  );
}
