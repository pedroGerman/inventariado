"use client";

import { Delete } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NumericKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  shortcuts?: number[];
  onShortcut?: (amount: number) => void;
}

export function NumericKeyboard({
  value,
  onChange,
  shortcuts,
  onShortcut,
}: NumericKeyboardProps) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];

  function handleKey(key: string) {
    if (key === "del") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "." && value.includes(".")) return;
    onChange(value + key);
  }

  return (
    <div className="space-y-4">
      {shortcuts && onShortcut && (
        <div className="flex flex-wrap gap-2">
          {shortcuts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => onShortcut(amount)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
            >
              RD$ {amount.toLocaleString("es-DO")}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleKey(key)}
            className={cn(
              "flex h-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-semibold text-slate-800 active:bg-slate-200",
              key === "del" && "text-danger",
            )}
          >
            {key === "del" ? <Delete className="h-5 w-5" /> : key}
          </button>
        ))}
      </div>
    </div>
  );
}
