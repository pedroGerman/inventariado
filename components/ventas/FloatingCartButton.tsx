"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore, type CartMode } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface FloatingCartButtonProps {
  mode: CartMode;
}

export function FloatingCartButton({ mode }: FloatingCartButtonProps) {
  const itemCount = useCartStore((s) => s.getItemCount(mode));
  const total = useCartStore((s) => s.getTotal(mode));

  if (itemCount === 0) return null;

  const href = mode === "sale" ? "/ventas/carrito" : "/compras/carrito";

  return (
    <div className="fixed bottom-20 right-3 z-30 mx-auto max-w-mobile safe-bottom">
      <Button
        asChild
        variant="success"
        size="sm"
        className="rounded-full px-4 py-2.5 shadow-lg"
        iconLeft={<ShoppingCart className="h-4 w-4" />}
      >
        <Link href={href}>
          {itemCount} · {formatCurrency(total)}
        </Link>
      </Button>
    </div>
  );
}
