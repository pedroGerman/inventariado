"use client";

import { CheckStateIcon } from "@/components/ui/CheckStateIcon";
import type { CardType } from "@/lib/utils/paymentMethod";
import { cn } from "@/lib/utils/cn";

const options: { id: CardType; label: string }[] = [
  { id: "debit", label: "Débito" },
  { id: "credit", label: "Crédito" },
];

interface CardTypeSelectorProps {
  value: CardType;
  onChange: (type: CardType) => void;
  className?: string;
}

export function CardTypeSelector({
  value,
  onChange,
  className,
}: CardTypeSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="px-0.5 text-xs font-medium text-slate-700">Tipo de tarjeta</p>
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
