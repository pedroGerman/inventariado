"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ffElevatedMetricSurfaceClass } from "@/lib/utils/ff-surfaces";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { Badge } from "@/components/ui/Badge";
import { Package, Plus } from "lucide-react";
import type { Product } from "@/lib/types/database";

interface ProductCardProps {
  product?: Product;
  quickSale?: boolean;
  quickLabel?: string;
  onClick?: () => void;
  readOnly?: boolean;
}

export function ProductCard({
  product,
  quickSale,
  quickLabel = "Venta Rápida",
  onClick,
  readOnly = false,
}: ProductCardProps) {
  if (quickSale) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          ffElevatedMetricSurfaceClass,
          "flex flex-col items-center border border-dashed border-[var(--button-success-border)]/35 bg-surface-3 p-2 text-center transition-[box-shadow,transform] active:scale-[0.98]",
        )}
      >
        <div className="mb-2 flex h-[88px] w-full items-center justify-center rounded-xl bg-surface-2 text-[var(--button-success)] shadow-segmented-track">
          <Plus className="h-9 w-9" strokeWidth={2.5} />
        </div>
        <span className="text-xs font-semibold text-[var(--button-success)]">
          {quickLabel}
        </span>
      </button>
    );
  }

  if (!product) return null;
  const outOfStock = product.stock === 0;

  const cardClassName = cn(
    ffElevatedMetricSurfaceClass,
    "relative flex flex-col p-2 text-left",
    !readOnly && "transition-[box-shadow,transform] active:scale-[0.98]",
    outOfStock && "opacity-60",
  );

  const cardContent = (
    <>
      {outOfStock && (
        <Badge variant="danger" className="absolute right-2.5 top-2.5 z-10">
          Agotado
        </Badge>
      )}
      <div className="mb-2 flex h-[88px] w-full items-center justify-center overflow-hidden rounded-xl bg-surface-2 shadow-segmented-track">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
        )}
      </div>
      <p className="line-clamp-1 text-xs font-medium text-card-foreground">
        {product.name}
      </p>
      <p className="mt-0.5 text-xs font-semibold tabular-nums text-[var(--button-success)]">
        {formatCurrency(product.sale_price)}
      </p>
    </>
  );

  if (readOnly) {
    return (
      <Link href={`/productos/${product.id}`} className={cardClassName}>
        {cardContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={outOfStock}
      className={cardClassName}
    >
      {cardContent}
    </button>
  );
}
