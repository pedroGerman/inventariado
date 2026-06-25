"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CartItemRow } from "@/components/ventas/CartItem";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { ArrowRight } from "lucide-react";

export default function ComprasCarritoPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  return (
    <>
      <Header title="Carrito Compras" showBack backHref="/compras" />
      <div className="space-y-3 px-4 py-4">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdateQty={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>
      <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-mobile border-t bg-white px-4 py-4">
        <p className="mb-3 text-center text-2xl font-bold">{formatCurrency(getTotal())}</p>
        <Button
          fullWidth
          disabled={items.length === 0}
          iconRight={<ArrowRight className="h-4 w-4" />}
          onClick={() => router.push("/compras/caja")}
        >
          CONTINUAR
        </Button>
      </div>
    </>
  );
}
