"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Save, Trash2 } from "lucide-react";
import { AddCustomerModal } from "@/components/caja/AddCustomerModal";
import { AddSupplierModal } from "@/components/caja/AddSupplierModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { savePendingPurchase, savePendingSale } from "@/lib/services/checkout";
import { deletePendingOrder, deletePendingPurchase } from "@/lib/services/orderActions";
import { useCartStore, type CartMode } from "@/lib/store/cart";
import { useCheckoutStore } from "@/lib/store/checkout";
import { useEmployeeStore } from "@/lib/store/employee";
import { cn } from "@/lib/utils/cn";
import type { Customer, Supplier } from "@/lib/types/database";

function CartAction({
  icon: Icon,
  label,
  tone = "default",
  disabled,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors disabled:opacity-50",
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

interface CartPendingActionsProps {
  mode: CartMode;
}

export function CartPendingActions({ mode }: CartPendingActionsProps) {
  const router = useRouter();
  const current = useEmployeeStore((s) => s.current);
  const items = useCartStore((s) => s.getItems(mode));
  const clearCart = useCartStore((s) => s.clearCart);
  const pendingId = useCartStore((s) => s.getPendingId(mode));
  const checkout = useCheckoutStore();

  const [customerModal, setCustomerModal] = useState(false);
  const [supplierModal, setSupplierModal] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSale = mode === "sale";
  const listHref = isSale
    ? "/ordenes?pending=1"
    : "/ordenes?tab=purchase&pending=1";

  async function persistPending(options: {
    isQuote: boolean;
    customerId?: string | null;
    supplierId?: string | null;
  }) {
    if (!current || items.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      if (isSale) {
        const order = await savePendingSale({
          items,
          employee: current,
          customerId: options.customerId ?? null,
          isQuote: options.isQuote,
          existingOrderId: pendingId,
        });

        clearCart(mode);
        checkout.reset();

        if (options.isQuote) {
          router.push(`/ordenes/${order.id}/cotizacion`);
          return;
        }
      } else {
        const purchase = await savePendingPurchase({
          items,
          employee: current,
          supplierId: options.supplierId ?? null,
          isQuote: options.isQuote,
          existingPurchaseId: pendingId,
        });

        clearCart(mode);
        checkout.reset();

        if (options.isQuote) {
          router.push(`/compras/ordenes/${purchase.id}/cotizacion`);
          return;
        }
      }

      router.push(listHref);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la orden.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    await persistPending({ isQuote: false });
  }

  async function handleQuoteCustomer(customer: Customer) {
    await persistPending({ isQuote: true, customerId: customer.id });
  }

  async function handleQuoteSupplier(supplier: Supplier) {
    await persistPending({ isQuote: true, supplierId: supplier.id });
  }

  async function handleClearCart() {
    setClearing(true);
    setError(null);

    try {
      if (pendingId) {
        if (isSale) {
          await deletePendingOrder(pendingId);
        } else {
          await deletePendingPurchase(pendingId);
        }
      }

      clearCart(mode);
      checkout.reset();
      setClearOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo vaciar el carrito.",
      );
    } finally {
      setClearing(false);
    }
  }

  return (
    <>
      <div className="flex border-b border-border/50 py-1">
        <CartAction
          icon={FileText}
          label="Cotizar"
          disabled={saving || items.length === 0}
          onClick={() =>
            isSale ? setCustomerModal(true) : setSupplierModal(true)
          }
        />
        <CartAction
          icon={Save}
          label="Guardar"
          disabled={saving || items.length === 0}
          onClick={handleSave}
        />
        <CartAction
          icon={Trash2}
          label="Borrar"
          tone="danger"
          disabled={saving || clearing || items.length === 0}
          onClick={() => setClearOpen(true)}
        />
      </div>

      {error && (
        <p className="px-1 pt-1 text-center text-xs text-destructive">{error}</p>
      )}

      <ConfirmDeleteModal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        loading={clearing}
        onConfirm={handleClearCart}
        title={pendingId ? "Descartar orden guardada" : "Vaciar carrito"}
        confirmLabel={pendingId ? "Sí, descartar" : "Sí, vaciar carrito"}
        loadingLabel="Descartando…"
        description={
          pendingId ? (
            <>
              Esta orden ya está guardada. Al descartarla se eliminará del
              historial y se quitarán{" "}
              <span className="font-semibold text-card-foreground">
                {items.length} producto{items.length === 1 ? "" : "s"}
              </span>{" "}
              del carrito.
            </>
          ) : (
            <>
              ¿Vaciar el carrito de {isSale ? "venta" : "compra"}? Se quitarán{" "}
              <span className="font-semibold text-card-foreground">
                {items.length} producto{items.length === 1 ? "" : "s"}
              </span>{" "}
              y no podrás deshacer esta acción.
            </>
          )
        }
      />

      <AddCustomerModal
        open={customerModal}
        onClose={() => setCustomerModal(false)}
        onSelect={handleQuoteCustomer}
      />

      <AddSupplierModal
        open={supplierModal}
        onClose={() => setSupplierModal(false)}
        onSelect={handleQuoteSupplier}
      />
    </>
  );
}
