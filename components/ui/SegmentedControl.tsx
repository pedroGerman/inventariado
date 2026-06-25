import { cn } from "@/lib/utils/cn";

type SegmentedOption<T extends string | number> = {
  value: T;
  label: string;
};

interface SegmentedControlProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
  size?: "sm" | "md";
  scrollable?: boolean;
  "aria-label"?: string;
}

function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
  className,
  size = "md",
  scrollable = false,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        scrollable ? "inline-flex w-max min-w-full" : "flex",
        "gap-1 rounded-xl bg-surface-2 p-1 shadow-segmented-track",
        className,
      )}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={String(option.value)}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-center rounded-lg font-medium transition-[color,background-color,box-shadow]",
              scrollable ? "shrink-0" : "flex-1",
              size === "sm"
                ? "px-3 py-1.5 text-xs sm:text-sm"
                : "px-3 py-2 text-sm",
              selected
                ? "bg-surface-3 text-card-foreground shadow-segmented-thumb"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedControl };
