"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CartItemRow } from "@/components/ventas/CartItem";
import { CartPendingActions } from "@/components/ventas/CartPendingActions";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export default function VentasCarritoPage() {
  const router = useRouter();
  const saleItems = useCartStore((s) => s.saleItems);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const itemCount = getItemCount("sale");
  const total = getTotal("sale");
  const items = saleItems;

  return (
    <>
      <Header
        title="Carrito"
        subtitle={
          itemCount > 0
            ? `${itemCount} artículo${itemCount === 1 ? "" : "s"}`
            : "Sin artículos"
        }
        showBack
        backHref="/ventas"
      />

      <div className="px-3 divide-y pb-[250px] divide-slate-200 flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] ">
        {items.length === 0 ? (
          <section className="flex flex-col justify-center  items-center gap-2 py-10">
            <p className="text-sm text-muted-foreground">El carrito está vacío</p>
            <Button variant="secondary" className="!rounded-md" size="sm" onClick={() => router.push("/ventas")}>
              Ir a ventas
            </Button>
          </section>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQty={(id, qty) => updateQuantity(id, qty, "sale")}
              onRemove={(id) => removeItem(id, "sale")}
            />
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-14 left-0 right-0 z-20 mx-auto max-w-mobile px-3.5 safe-bottom">
          <Card className="gap-0 !pb-3 !pt-0 overflow-hidden rounded-b-none shadow-ff-surface-4">
            <CardContent className="space-y-3 !px-3.5 !pb-3.5">
              <CartPendingActions mode="sale" />

              <div className="flex flex-col gap-3 pt-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Subtotal productos:
                    </span>
                    <span className="text-sm font-medium tabular-nums text-muted-foreground">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <hr className="border-border/50" />

                <div className="flex items-center justify-between">
                  <span className="font-bold text-card-foreground">Total</span>
                  <span className="text-lg font-bold tabular-nums text-card-foreground">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  variant="default"
                  fullWidth
                  size="sm"
                  className="!rounded-md py-5 text-xs font-bold"
                  onClick={() => router.push("/ventas/caja")}
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
