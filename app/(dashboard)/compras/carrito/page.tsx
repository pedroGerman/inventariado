"use client";

import { useRouter } from "next/navigation";
import { FileText, Save, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CartItemRow } from "@/components/ventas/CartItem";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils/cn";

function CartAction({
  icon: Icon,
  label,
  tone = "default",
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  tone?: "default" | "danger";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors",
        tone === "danger"
          ? "text-destructive hover:bg-red-50"
          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function ComprasCarritoPage() {
  const router = useRouter();
  const purchaseItems = useCartStore((s) => s.purchaseItems);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const itemCount = getItemCount("purchase");
  const total = getTotal("purchase");
  const items = purchaseItems;

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
        backHref="/compras"
      />

      <div className="px-4 divide-y pb-[250px] divide-slate-200 flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] ">
        {items.length === 0 ? (
          <section className="flex flex-col justify-center  items-center gap-2 py-10">
            <p className="text-sm text-muted-foreground">El carrito está vacío</p>
            <Button variant="secondary" className="!rounded-md" size="sm" onClick={() => router.push("/compras")}>
              Ir a compras
            </Button>
          </section>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQty={(id, qty) => updateQuantity(id, qty, "purchase")}
              onRemove={(id) => removeItem(id, "purchase")}
            />
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-14  left-0 right-0 z-20 mx-auto max-w-mobile px-4 safe-bottom">
          <Card className="gap-0 !pb-3 !pt-0 overflow-hidden rounded-b-none shadow-ff-surface-4">
            <CardContent className="space-y-3 !px-3.5 !pb-3.5">

              <div className="flex border-b border-border/50 py-1">
                <CartAction icon={FileText} label="Cotizar" />
                <CartAction icon={Save} label="Guardar" />
                <CartAction
                  icon={Trash2}
                  label="Borrar"
                  tone="danger"
                  onClick={() => clearCart("purchase")}
                />
              </div>

              <div className="pt-1 flex flex-col gap-3">
                {/* <h2 className="text-sm font-bold text-card-foreground">
                  Resumen del pedido
                </h2> */}

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

                <div className=" flex items-center justify-between">
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
                  onClick={() => router.push("/ventas/caja?tab=purchase")}
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
