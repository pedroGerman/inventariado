"use client";

import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { CartItem } from "@/lib/store/cart";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({ item, onUpdateQty, onRemove }: CartItemRowProps) {
  return (
    <div className="py-6 pr-0.5 flex w-full items-center gap-3 text-left">

      <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-surface-2 shadow-segmented-track">
        {/* <Package className="h-6 w-6 text-muted-foreground" /> */}
        <Package className="h-6 w-6 text-muted-foreground" />
        {/* <DollarSign className="h-5 w-5 text-primary" /> */}
      </div>

      <div className="min-w-0 flex-1 flex flex-col">
        <p className="truncate text-sm text-card-foreground">
          {item.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
          <span className="text-xs">{formatCurrency(item.unit_price)} c/u</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
          <p className="text-sm font-bold text-primary tabular-nums">
            {formatCurrency(item.total_price)}
          </p>
        </div>
      </div>

      <div className="text-right flex flex-col justify-between h-full gap-7 items-end">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="rounded-lg text-destructive transition-colors hover:bg-red-50"
          aria-label={`Eliminar ${item.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-6 rounded-full"
            onClick={() => onUpdateQty(item.id, item.quantity - 1)}
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">
            {item.quantity}
          </span>
          <Button
            type="button"
            variant="success"
            size="icon"
            className="size-6 rounded-full"
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {/* <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" /> */}
    </div>
  );
}
