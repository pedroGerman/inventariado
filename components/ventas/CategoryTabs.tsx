"use client";

import { cn } from "@/lib/utils/cn";
import type { Category } from "@/lib/types/database";

interface CategoryTabsProps {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="-mx-1 overflow-x-auto px-4 pb-2">
      <div className="inline-flex min-w-full gap-1 rounded-xl bg-surface-2 p-1 shadow-segmented-track">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-[color,background-color,box-shadow]",
            selected === null
              ? "bg-surface-3 text-card-foreground shadow-segmented-thumb"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-[color,background-color,box-shadow]",
              selected === cat.id
                ? "bg-surface-3 text-card-foreground shadow-segmented-thumb"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
