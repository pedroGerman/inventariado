"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Truck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { SelectableButtonGroup } from "@/components/ui/SelectableButtonGroup";
import { PaymentMethods } from "@/components/caja/PaymentMethods";
import { AddSupplierModal } from "@/components/caja/AddSupplierModal";
import { ConfirmPaymentModal } from "@/components/caja/ConfirmPaymentModal";
import { useCartStore } from "@/lib/store/cart";
import { useCheckoutStore } from "@/lib/store/checkout";
import { useEmployeeStore } from "@/lib/store/employee";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { finalizePurchase } from "@/lib/services/checkout";
import { cn } from "@/lib/utils/cn";
import type { PaymentType } from "@/lib/types/database";
import { todayISO } from "@/lib/utils/date";

const paymentTabs: { id: PaymentType; label: string }[] = [
  { id: "pay_all", label: "Pagar todo" },
  { id: "deposit", label: "Abonar" },
  { id: "pay_later", label: "Pagar después" },
];

export default function ComprasCajaPage() {
  return (
    <Suspense fallback={null}>
      <ComprasCajaPageContent />
    </Suspense>
  );
}

function ComprasCajaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getTotal, clearCart } = useCartStore();
  const current = useEmployeeStore((s) => s.current);
  const checkout = useCheckoutStore();
  const [supplierModal, setSupplierModal] = useState(false);
  const [highlightSupplierId, setHighlightSupplierId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [date] = useState(todayISO());
  const total = getTotal();

  useEffect(() => {
    if (searchParams.get("openSupplierDrawer") !== "1") return;

    setSupplierModal(true);
    setHighlightSupplierId(searchParams.get("supplierId"));

    router.replace("/compras/caja", { scroll: false });
  }, [searchParams, router]);

  function handleFinalize() {
    if (!current || items.length === 0) return;
    finalizePurchase({
      items,
      employee: current,
      supplierId: checkout.supplier?.id ?? null,
      paymentMethod: checkout.paymentMethod,
      paymentType: checkout.paymentType as "pay_all" | "deposit" | "pay_later",
      discount: 0,
      tax: 0,
    });
    clearCart();
    checkout.reset();
    router.push("/compras/ordenes?success=1");
  }

  return (
    <>
      <Header title="Caja Compras" subtitle={date} showBack backHref="/compras/carrito" />

      <div className="flex flex-col gap-4 px-4 py-4 pb-5">
        <div className="flex items-center justify-between gap-4 px-3 py-2.5">
          <div>
            <p className="text-sm text-muted-foreground">Total a pagar</p>
          </div>
          <p className="text-base font-bold tabular-nums text-card-foreground">
            {formatCurrency(total)}
          </p>
        </div>

        <Button
          variant="secondary"
          fullWidth
          iconLeft={<Truck className="h-4 w-4" />}
          onClick={() => setSupplierModal(true)}
          className={cn(
            checkout.supplier &&
              "text-left [&>span:last-child]:truncate [&>span:last-child]:flex-1",
          )}
        >
          {checkout.supplier ? checkout.supplier.name : "Agregar proveedor"}
        </Button>

        <section className="space-y-2">
          <h2 className="px-0.5 text-sm font-semibold text-card-foreground">
            Modo de pago
          </h2>
          <SelectableButtonGroup
            aria-label="Modo de pago"
            columns={3}
            value={checkout.paymentType}
            onChange={checkout.setPaymentType}
            options={paymentTabs.map((tab) => ({
              value: tab.id,
              label: tab.label,
            }))}
          />
        </section>

        <section className="space-y-2">
          <h2 className="px-0.5 text-sm font-semibold text-card-foreground">
            Método de pago
          </h2>
          <PaymentMethods
            selected={checkout.paymentMethod}
            onSelect={checkout.setPaymentMethod}
          />
        </section>
      </div>

      <div className="px-4 py-4">
        <Button
          fullWidth
          variant="success"
          disabled={items.length === 0}
          onClick={() => setConfirmModal(true)}
        >
          FINALIZAR
        </Button>
      </div>

      <AddSupplierModal
        open={supplierModal}
        onClose={() => {
          setSupplierModal(false);
          setHighlightSupplierId(null);
        }}
        onSelect={checkout.setSupplier}
        highlightSupplierId={highlightSupplierId}
      />

      <ConfirmPaymentModal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        total={total}
        paymentType={checkout.paymentType}
        paymentMethod={checkout.paymentMethod}
        onConfirm={() => handleFinalize()}
      />
    </>
  );
}
