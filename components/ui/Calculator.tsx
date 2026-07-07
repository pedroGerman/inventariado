"use client";

import { cn } from "@/lib/utils/cn";

interface CalculatorProps {
  value: string;
  onChange: (value: string) => void;
}

export function Calculator({ value, onChange }: CalculatorProps) {
  const keys = [
    "C", "÷", "×", "⌫",
    "7", "8", "9", "-",
    "4", "5", "6", "+",
    "1", "2", "3", "=",
    "0", ".",
  ];

  function handleKey(key: string) {
    if (key === "C") {
      onChange("");
      return;
    }
    if (key === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "=") {
      try {
        const expr = value
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/[^0-9+\-*/.()]/g, "");
        const result = Function(`"use strict"; return (${expr})`)();
        if (typeof result === "number" && isFinite(result)) {
          onChange(String(Math.round(result * 100) / 100));
        }
      } catch {
        // ignore invalid expressions
      }
      return;
    }
    onChange(value + key);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right text-2xl font-bold text-slate-900">
        {value || "0"}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {keys.map((key, i) => (
          <button
            key={`${key}-${i}`}
            type="button"
            onClick={() => {
              if (document.activeElement instanceof HTMLInputElement) {
                document.activeElement.blur();
              }
              handleKey(key);
            }}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-semibold active:bg-slate-200",
              ["+", "-", "×", "÷", "="].includes(key) && "bg-primary/10 text-primary",
              key === "C" && "text-danger",
              key === "0" && "col-span-2",
            )}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
