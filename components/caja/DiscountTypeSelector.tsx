"use client";

import { CheckStateIcon } from "@/components/ui/CheckStateIcon";
import type { DiscountType } from "@/lib/utils/discount";
import { cn } from "@/lib/utils/cn";

const options: { id: DiscountType; label: string }[] = [
  { id: "percent", label: "Porcentaje" },
  { id: "fixed", label: "Monto fijo" },
];

interface DiscountTypeSelectorProps {
  value: DiscountType;
  onChange: (type: DiscountType) => void;
  className?: string;
}

export function DiscountTypeSelector({
  value,
  onChange,
  className,
}: DiscountTypeSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="px-0.5 text-xs font-medium text-slate-700">Tipo de descuento</p>
      <div className="flex gap-2">
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                selected
                  ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-3",
              )}
            >
              <CheckStateIcon state={selected ? "success" : "skipped"} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
