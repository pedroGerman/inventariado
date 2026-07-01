"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, UserPlus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { SelectableButtonGroup } from "@/components/ui/SelectableButtonGroup";
import { PaymentMethods } from "@/components/caja/PaymentMethods";
import { AddCustomerModal } from "@/components/caja/AddCustomerModal";
import { ConfirmPaymentModal } from "@/components/caja/ConfirmPaymentModal";
import { useCartStore } from "@/lib/store/cart";
import { useCheckoutStore } from "@/lib/store/checkout";
import { useEmployeeStore } from "@/lib/store/employee";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { finalizeSale } from "@/lib/services/checkout";
import type { PaymentType } from "@/lib/types/database";
import { todayISO } from "@/lib/utils/date";

const paymentTabs: { id: PaymentType; label: string }[] = [
  { id: "pay_all", label: "Pagar todo" },
  { id: "deposit", label: "Abonar" },
  { id: "pay_later", label: "Pagar después" },
  { id: "split", label: "Dividir cuenta" },
];

export default function VentasCajaPage() {
  return (
    <Suspense fallback={null}>
      <VentasCajaPageContent />
    </Suspense>
  );
}

function VentasCajaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getTotal, clearCart } = useCartStore();
  const current = useEmployeeStore((s) => s.current);
  const checkout = useCheckoutStore();
  const [customerModal, setCustomerModal] = useState(false);
  const [highlightCustomerId, setHighlightCustomerId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [reopenConfirmAfterCustomer, setReopenConfirmAfterCustomer] =
    useState(false);
  const [date] = useState(todayISO());

  useEffect(() => {
    if (searchParams.get("openCustomerDrawer") !== "1") return;

    setCustomerModal(true);
    setHighlightCustomerId(searchParams.get("customerId"));

    router.replace("/ventas/caja", { scroll: false });
  }, [searchParams, router]);

  const subtotal = getTotal();
  const total =
    subtotal +
    (checkout.includeDelivery ? checkout.service : 0) +
    checkout.tax -
    (checkout.includeDiscount ? checkout.discount : 0);

  async function handleFinalize(toPay: number, received: number) {
    if (!current || items.length === 0) return;

    const { order, debt } = await finalizeSale({
      items,
      employee: current,
      customerId: checkout.customer?.id ?? null,
      paymentMethod: checkout.paymentMethod,
      paymentType: checkout.paymentType,
      discount: checkout.includeDiscount ? checkout.discount : 0,
      service: checkout.includeDelivery ? checkout.service : 0,
      tax: checkout.tax,
      toPay,
      cashReceived: received > 0 ? received : undefined,
    });

    clearCart();
    checkout.reset();
    setConfirmModal(false);

    if (debt) {
      router.push(`/deudas/${debt.id}`);
      return;
    }
    router.push(`/ordenes/${order.id}?success=1`);
  }

  return (
    <>
      <Header title="Caja" subtitle={date} showBack backHref="/ventas/carrito" />

      <div className="flex flex-col gap-4 px-4 py-4 pb-5">
        <Card className="gap-0 !py-0">
          <CardContent className="divide-y divide-border/50 !px-5 !py-0">
            <Toggle
              label="Incluir descuento"
              checked={checkout.includeDiscount}
              onChange={checkout.setIncludeDiscount}
            />
            <Toggle
              label="Incluir domicilio"
              checked={checkout.includeDelivery}
              onChange={checkout.setIncludeDelivery}
            />
          </CardContent>
        </Card>

          <div className="flex items-center justify-between gap-4 px-1 py-2.5">
            <div>
              <p className="text-sm text-muted-foreground">Total a cobrar</p>
              {checkout.includeDiscount || checkout.includeDelivery ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Subtotal {formatCurrency(subtotal)}
                </p>
              ) : null}
            </div>
            <p className="text-base font-bold tabular-nums text-card-foreground">
              {formatCurrency(total)}
            </p>
          </div>

        <Button
          variant="secondary"
          fullWidth
          iconLeft={
            checkout.customer ? undefined : <UserPlus className="h-4 w-4" />
          }
          onClick={() => setCustomerModal(true)}
        >
          {checkout.customer ? (
            <span className="inline-flex min-w-0 max-w-full items-center justify-center gap-1.5">
              <UserPlus className="h-4 w-4 shrink-0" />
              <span className="truncate">{checkout.customer.name}</span>
            </span>
          ) : (
            "Agregar cliente"
          )}
        </Button>

        <section className="space-y-2">
          <h2 className="px-0.5 text-sm font-semibold text-card-foreground">
            Modo de pago
          </h2>
          <SelectableButtonGroup
            aria-label="Modo de pago"
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

          <div className="space-y-3 px-4 py-4">
            <Button
              type="button"
              variant="default"
              fullWidth
              iconLeft={<ShoppingCart className="h-4 w-4" />}
              iconRight={
                items.length > 0 ? (
                  <span className="inline-flex w-5 aspect-square items-center justify-center rounded-full bg-destructive  text-[10px] font-bold leading-none text-white">
                    {items.length}
                  </span>
                ) : undefined
              }
              onClick={() => router.push("/ventas/carrito")}
            >
              Pre orden
            </Button>

            <Button
              fullWidth
              variant="success"
              disabled={items.length === 0}
              onClick={() => setConfirmModal(true)}
            >
              Continuar
            </Button>
      </div>

      <AddCustomerModal
        open={customerModal}
        onClose={() => {
          setCustomerModal(false);
          setHighlightCustomerId(null);
          setReopenConfirmAfterCustomer(false);
        }}
        onSelect={(customer) => {
          checkout.setCustomer(customer);
          if (reopenConfirmAfterCustomer) {
            setReopenConfirmAfterCustomer(false);
            setConfirmModal(true);
          }
        }}
        highlightCustomerId={highlightCustomerId}
      />

      <ConfirmPaymentModal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        total={total}
        paymentType={checkout.paymentType}
        paymentMethod={checkout.paymentMethod}
        customerName={checkout.customer?.name}
        onConfirm={handleFinalize}
        onRequireCustomer={() => {
          setConfirmModal(false);
          setReopenConfirmAfterCustomer(true);
          setCustomerModal(true);
        }}
      />
    </>
  );
}
