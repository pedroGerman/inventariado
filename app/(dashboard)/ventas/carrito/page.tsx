"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Save, Trash2 } from "lucide-react";
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

export default function VentasCarritoPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } =
    useCartStore();

  const itemCount = getItemCount();
  const total = getTotal();

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

      <div className="px-4 py-2 divide-y divide-slate-200 flex flex-col items-center justify-center h-[calc(100vh-15rem)] ">
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
              onUpdateQty={updateQuantity}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-20 mx-auto max-w-mobile px-4 safe-bottom">
          <Card className="gap-0 overflow-hidden py-0 shadow-ff-surface-4">
            <CardContent className="space-y-3 px-4 py-4">

              <div className="flex border-y border-border/50 py-1">
                <CartAction icon={FileText} label="Cotizar" />
                <CartAction icon={Save} label="Guardar" />
                <CartAction
                  icon={Trash2}
                  label="Borrar"
                  tone="danger"
                  onClick={clearCart}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold tabular-nums text-card-foreground">
                  {formatCurrency(total)}
                </span>
              </div>



              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold tabular-nums text-card-foreground">
                    {formatCurrency(total)}
                  </p>
                </div>
                <Button
                  variant="success"
                  size="lg"
                  className="min-w-[140px]"
                  iconRight={<ArrowRight className="h-4 w-4" />}
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
