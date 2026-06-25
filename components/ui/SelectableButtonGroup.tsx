"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type SelectableButtonOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

interface SelectableButtonGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectableButtonOption<T>[];
  columns?: 1 | 2 | 3;
  "aria-label"?: string;
  className?: string;
}

function SelectableButtonGroup<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
  "aria-label": ariaLabel,
  className,
}: SelectableButtonGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "grid gap-2",
        columns === 3
          ? "grid-cols-2"
          : columns === 2
            ? "grid-cols-2"
            : "grid-cols-1",
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-selected={isSelected ? "true" : "false"}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex min-h-[52px] items-center rounded-xl border-0 px-3 py-3 text-sm transition-[color,background-color,box-shadow,transform]",
              option.icon ? "gap-1.5 text-left" : "justify-center text-center",
              isSelected
                ? "bg-green-50 font-semibold text-[var(--button-success)] shadow-button-tone-green-rest dark:bg-green-950/35"
                : "bg-surface-2 font-medium text-muted-foreground shadow-card-edge hover:bg-surface-3 hover:text-secondary-foreground hover:shadow-overview-metric active:scale-[0.99]",
            )}
          >
            {option.icon}
            <span className={option.icon ? "min-w-0 flex-1" : undefined}>
              {option.label}
            </span>
            {isSelected ? (
              <Check
                className={cn(
                  "h-4 w-4 shrink-0 absolute right-2 top-1/2 -translate-y-1/2 text-[var(--button-success)]",
                  !option.icon &&
                    "absolute right-3 top-1/2 -translate-y-1/2",
                )}
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export { SelectableButtonGroup };
