"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, Truck, UserPlus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectableButtonGroup } from "@/components/ui/SelectableButtonGroup";
import { PaymentMethods } from "@/components/caja/PaymentMethods";
import { AddCustomerModal } from "@/components/caja/AddCustomerModal";
import { AddSupplierModal } from "@/components/caja/AddSupplierModal";
import { ConfirmPaymentModal } from "@/components/caja/ConfirmPaymentModal";
import { DiscountModal } from "@/components/caja/DiscountModal";
import { CheckoutSummary } from "@/components/caja/CheckoutSummary";
import { useCartStore, type CartMode } from "@/lib/store/cart";
import { useCheckoutStore } from "@/lib/store/checkout";
import { useEmployeeStore } from "@/lib/store/employee";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { getOrder, getPurchase } from "@/lib/mock/db";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { finalizePurchase, finalizeSale } from "@/lib/services/checkout";
import { cn } from "@/lib/utils/cn";
import type { PaymentType } from "@/lib/types/database";
import { todayISO } from "@/lib/utils/date";

const salePaymentTabs: { id: PaymentType; label: string }[] = [
  { id: "pay_all", label: "Pagar todo" },
  { id: "deposit", label: "Abonar" },
  { id: "pay_later", label: "Pagar después" },
];

const purchasePaymentTabs: { id: PaymentType; label: string }[] = [
  { id: "pay_all", label: "Pagar todo" },
  { id: "deposit", label: "Abonar" },
  { id: "pay_later", label: "Pagar después" },
];

export default function VentasCajaPage() {
  return (
    <Suspense fallback={null}>
      <CajaPageContent />
    </Suspense>
  );
}

function CajaPageContent() {
  useMockDBRefresh();
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleItems = useCartStore((s) => s.saleItems);
  const purchaseItems = useCartStore((s) => s.purchaseItems);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const clearPendingLink = useCartStore((s) => s.clearPendingLink);
  const getPendingId = useCartStore((s) => s.getPendingId);
  const current = useEmployeeStore((s) => s.current);
  const checkout = useCheckoutStore();

  const [tab, setTab] = useState<CartMode>("sale");
  const [customerModal, setCustomerModal] = useState(false);
  const [supplierModal, setSupplierModal] = useState(false);
  const [highlightCustomerId, setHighlightCustomerId] = useState<string | null>(null);
  const [highlightSupplierId, setHighlightSupplierId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [discountModal, setDiscountModal] = useState(false);
  const [reopenConfirmAfterCustomer, setReopenConfirmAfterCustomer] =
    useState(false);
  const [reopenConfirmAfterSupplier, setReopenConfirmAfterSupplier] =
    useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [date] = useState(todayISO());

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab === "purchase") setTab("purchase");
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("openCustomerDrawer") !== "1") return;

    setTab("sale");
    setCustomerModal(true);
    setHighlightCustomerId(searchParams.get("customerId"));
    router.replace("/ventas/caja", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    if (searchParams.get("openSupplierDrawer") !== "1") return;

    setTab("purchase");
    setSupplierModal(true);
    setHighlightSupplierId(searchParams.get("supplierId"));
    router.replace("/ventas/caja?tab=purchase", { scroll: false });
  }, [searchParams, router]);

  const items = tab === "sale" ? saleItems : purchaseItems;
  const subtotal = getTotal(tab);
  const discountAmount = checkout.getDiscountAmount(subtotal);
  const total = Math.max(0, subtotal + checkout.tax - discountAmount);
  const cartHref = tab === "sale" ? "/ventas/carrito" : "/compras/carrito";

  useEffect(() => {
    setConfirmModal(false);
    setFinalizeError(null);
  }, [tab]);

  useEffect(() => {
    const pendingSaleId = getPendingId("sale");
    if (pendingSaleId && !getOrder(pendingSaleId)) {
      clearPendingLink("sale");
    }
    const pendingPurchaseId = getPendingId("purchase");
    if (pendingPurchaseId && !getPurchase(pendingPurchaseId)) {
      clearPendingLink("purchase");
    }
  }, [clearPendingLink, getPendingId]);

  function handleDiscountToggle(checked: boolean) {
    if (checked) {
      setDiscountModal(true);
      return;
    }
    checkout.clearDiscount();
  }

  function handleDiscountApply(type: "percent" | "fixed", value: number) {
    checkout.applyDiscount(type, value);
    setDiscountModal(false);
  }

  async function handleFinalizeSale(toPay: number, received: number) {
    if (finalizing || !current || saleItems.length === 0 || !checkout.customer) {
      return;
    }

    setFinalizing(true);
    setFinalizeError(null);

    try {
      const { order, debt } = await finalizeSale({
        items: saleItems,
        employee: current,
        customerId: checkout.customer.id,
        paymentMethod: checkout.paymentMethod,
        paymentType: checkout.paymentType,
        discount: discountAmount,
        service: 0,
        tax: checkout.tax,
        toPay,
        cashReceived: received > 0 ? received : undefined,
        pendingOrderId: getPendingId("sale"),
      });

      clearCart("sale");
      checkout.reset();
      setConfirmModal(false);

      if (debt) {
        router.push(`/deudas/${debt.id}`);
        return;
      }
      router.push(`/ordenes/${order.id}?success=1`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo finalizar la venta.";
      if (message.includes("pendiente ya no está disponible")) {
        clearPendingLink("sale");
      }
      setFinalizeError(message);
    } finally {
      setFinalizing(false);
    }
  }

  async function handleFinalizePurchase(toPay: number, received: number) {
    if (
      finalizing ||
      !current ||
      purchaseItems.length === 0 ||
      !checkout.supplier
    ) {
      return;
    }

    setFinalizing(true);
    setFinalizeError(null);

    try {
      const { purchase, debt } = await finalizePurchase({
        items: purchaseItems,
        employee: current,
        supplierId: checkout.supplier.id,
        paymentMethod: checkout.paymentMethod,
        paymentType: checkout.paymentType as "pay_all" | "deposit" | "pay_later",
        discount: discountAmount,
        tax: checkout.tax,
        toPay,
        cashPaid: received > 0 ? received : undefined,
        pendingPurchaseId: getPendingId("purchase"),
      });

      clearCart("purchase");
      checkout.reset();
      setConfirmModal(false);

      if (debt) {
        router.push(`/deudas/${debt.id}`);
        return;
      }
      router.push(`/compras/ordenes/${purchase.id}?success=1`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo finalizar la compra.";
      if (message.includes("pendiente ya no está disponible")) {
        clearPendingLink("purchase");
      }
      setFinalizeError(message);
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <>
      <Header
        title="Caja"
        subtitle={date}
        showBack
        backHref={cartHref}
      />

      <div className="px-3 pt-3">
        <SegmentedControl
          aria-label="Tipo de caja"
          value={tab}
          onChange={setTab}
          options={[
            { value: "sale", label: "Venta" },
            { value: "purchase", label: "Compra" },
          ]}
        />
      </div>

      {tab === "sale" ? (
        <div className="flex flex-col gap-4 px-3 py-4 pb-5">
          <Card className="gap-0 !py-0">
            <CardContent className="divide-y divide-border/50 !px-3.5 !py-0">
              <Toggle
                label="Incluir descuento"
                checked={checkout.includeDiscount}
                onChange={handleDiscountToggle}
              />
            </CardContent>
          </Card>

          {checkout.includeDiscount ? (
            <div className="px-1">
              <CheckoutSummary
                subtotal={subtotal}
                tax={checkout.tax}
                discount={discountAmount}
                total={total}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 px-1 py-2.5">
              <p className="text-sm text-muted-foreground">Total a cobrar</p>
              <p className="text-base font-bold tabular-nums text-card-foreground">
                {formatCurrency(total)}
              </p>
            </div>
          )}

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
              options={salePaymentTabs.map((paymentTab) => ({
                value: paymentTab.id,
                label: paymentTab.label,
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
      ) : (
        <div className="flex flex-col gap-4 px-3 py-4 pb-5">
          <Card className="gap-0 !py-0">
            <CardContent className="divide-y divide-border/50 !px-3.5 !py-0">
              <Toggle
                label="Incluir descuento"
                checked={checkout.includeDiscount}
                onChange={handleDiscountToggle}
              />
            </CardContent>
          </Card>

          {checkout.includeDiscount ? (
            <div className="px-1">
              <CheckoutSummary
                subtotal={subtotal}
                tax={checkout.tax}
                discount={discountAmount}
                total={total}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 px-1 py-2.5">
              <p className="text-sm text-muted-foreground">Total a pagar</p>
              <p className="text-base font-bold tabular-nums text-card-foreground">
                {formatCurrency(total)}
              </p>
            </div>
          )}

          <Button
            variant="secondary"
            fullWidth
            onClick={() => setSupplierModal(true)}
            className={cn(
              checkout.supplier &&
                "text-left [&>span:last-child]:truncate [&>span:last-child]:flex-1",
            )}
          >
            <span className="inline-flex min-w-0 max-w-full items-center justify-center gap-1.5">
                <Truck className="h-4 w-4 shrink-0" />
                <span className="truncate">{checkout.supplier ? checkout.supplier.name : "Agregar proveedor"}</span>
              </span> 
            
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
              options={purchasePaymentTabs.map((paymentTab) => ({
                value: paymentTab.id,
                label: paymentTab.label,
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
      )}

      <div className="flex flex-col gap-3 px-3 py-4">
        <Button
          type="button"
          variant="default"
          fullWidth
          iconLeft={<ShoppingCart className="h-4 w-4" />}
          iconRight={
            items.length > 0 ? (
              <span className="inline-flex aspect-square w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold leading-none text-white">
                {items.length}
              </span>
            ) : undefined
          }
          onClick={() => router.push(cartHref)}
        >
          Pre orden
        </Button>

        <Button
          fullWidth
          variant="success"
          disabled={items.length === 0 || finalizing}
          onClick={() => {
            if (tab === "sale" && !checkout.customer) {
              setReopenConfirmAfterCustomer(true);
              setCustomerModal(true);
              return;
            }
            if (tab === "purchase" && !checkout.supplier) {
              setReopenConfirmAfterSupplier(true);
              setSupplierModal(true);
              return;
            }
            setConfirmModal(true);
          }}
        >
          {tab === "sale" ? "Continuar" : "Finalizar"}
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

      <AddSupplierModal
        open={supplierModal}
        onClose={() => {
          setSupplierModal(false);
          setHighlightSupplierId(null);
          setReopenConfirmAfterSupplier(false);
        }}
        onSelect={(supplier) => {
          checkout.setSupplier(supplier);
          if (reopenConfirmAfterSupplier) {
            setReopenConfirmAfterSupplier(false);
            setConfirmModal(true);
          }
        }}
        highlightSupplierId={highlightSupplierId}
      />

      <DiscountModal
        open={discountModal}
        subtotal={subtotal}
        initialType={checkout.discountType}
        initialValue={checkout.discountValue}
        onClose={() => setDiscountModal(false)}
        onApply={handleDiscountApply}
      />

      <ConfirmPaymentModal
        open={confirmModal}
        onClose={() => {
          if (finalizing) return;
          setConfirmModal(false);
          setFinalizeError(null);
        }}
        total={total}
        flow={tab}
        paymentType={checkout.paymentType}
        paymentMethod={checkout.paymentMethod}
        submitting={finalizing}
        error={finalizeError}
        customerName={tab === "sale" ? checkout.customer?.name : checkout.supplier?.name}
        onConfirm={
          tab === "sale"
            ? handleFinalizeSale
            : handleFinalizePurchase
        }
        onRequireCustomer={
          tab === "sale"
            ? () => {
                setConfirmModal(false);
                setReopenConfirmAfterCustomer(true);
                setCustomerModal(true);
              }
            : () => {
                setConfirmModal(false);
                setReopenConfirmAfterSupplier(true);
                setSupplierModal(true);
              }
        }
      />
    </>
  );
}
