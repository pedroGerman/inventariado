"use client";

import { cn } from "@/lib/utils/cn";

interface AmountDisplayFieldProps {
  label: string;
  value: string;
  /** Highlights the field as the current target of the numeric keyboard. */
  active?: boolean;
  onActivate?: () => void;
  placeholder?: string;
  error?: string;
  /** Optional currency prefix, e.g. "RD$". */
  prefix?: string;
  className?: string;
}

/**
 * Tap-to-edit amount field that intentionally avoids a native <input>, so the
 * device's software keyboard never opens and overlaps our custom numeric
 * keyboard. Value is driven externally by <NumericKeyboard />.
 */
export function AmountDisplayField({
  label,
  value,
  active = false,
  onActivate,
  placeholder = "0",
  error,
  prefix,
  className,
}: AmountDisplayFieldProps) {
  return (
    <div className={cn("w-full", className)}>
      <label className="mb-1.5 block text-xs font-medium text-slate-700">
        {label}
      </label>
      <button
        type="button"
        onClick={onActivate}
        aria-invalid={error ? true : undefined}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-md bg-input-surface px-3 text-left shadow-input-edge transition-shadow outline-none",
          active && "ring-2 ring-neutral-300",
          error && "ring-2 ring-destructive/40",
        )}
      >
        {prefix ? (
          <span className="text-sm font-medium text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        <span
          className={cn(
            "flex-1 truncate text-right text-lg font-bold tabular-nums",
            value ? "text-card-foreground" : "text-muted-foreground",
          )}
        >
          {value || placeholder}
        </span>
      </button>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
