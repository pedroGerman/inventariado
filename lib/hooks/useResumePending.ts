"use client";

import { useRouter } from "next/navigation";
import { getCustomers, getProducts, getSuppliers } from "@/lib/mock/db";
import { useCartStore, type CartMode } from "@/lib/store/cart";
import { useCheckoutStore } from "@/lib/store/checkout";
import { useCartReplaceConfirmStore } from "@/lib/store/cartReplaceConfirm";
import {
  cartItemsFromOrder,
  cartItemsFromPurchase,
} from "@/lib/utils/cartFromOrder";
import type { Order, Purchase } from "@/lib/types/database";

function requestCartReplace(
  mode: CartMode,
  proceed: () => void,
  kind: "sale" | "purchase",
) {
  const itemCount = useCartStore.getState().getItemCount(mode);
  if (itemCount === 0) {
    proceed();
    return;
  }

  useCartReplaceConfirmStore.getState().request({
    title: "Reemplazar carrito",
    confirmLabel: "Reemplazar carrito",
    description:
      kind === "sale"
        ? `Ya tienes ${itemCount} artículo${itemCount === 1 ? "" : "s"} en el carrito de venta. Al retomar esta orden se perderán.`
        : `Ya tienes ${itemCount} artículo${itemCount === 1 ? "" : "s"} en el carrito de compra. Al retomar esta orden se perderán.`,
    onConfirm: proceed,
  });
}

export function useResumeSaleOrder() {
  const router = useRouter();
  const loadPending = useCartStore((s) => s.loadPending);
  const checkout = useCheckoutStore();

  function resumeNow(order: Order) {
    const products = getProducts();
    const items = cartItemsFromOrder(order, products);
    checkout.reset();
    loadPending(items, order.id, "sale");

    if (order.customer_id) {
      const customer = getCustomers().find((c) => c.id === order.customer_id);
      checkout.setCustomer(customer ?? null);
    } else {
      checkout.setCustomer(null);
    }

    router.push("/ventas/carrito");
  }

  function resume(order: Order) {
    requestCartReplace("sale", () => resumeNow(order), "sale");
  }

  return { resume };
}

export function useResumePurchaseOrder() {
  const router = useRouter();
  const loadPending = useCartStore((s) => s.loadPending);
  const checkout = useCheckoutStore();

  function resumeNow(purchase: Purchase) {
    const products = getProducts();
    const items = cartItemsFromPurchase(purchase, products);
    checkout.reset();
    loadPending(items, purchase.id, "purchase");

    if (purchase.supplier_id) {
      const supplier = getSuppliers().find((s) => s.id === purchase.supplier_id);
      checkout.setSupplier(supplier ?? null);
    } else {
      checkout.setSupplier(null);
    }

    router.push("/compras/carrito");
  }

  function resume(purchase: Purchase) {
    requestCartReplace("purchase", () => resumeNow(purchase), "purchase");
  }

  return { resume };
}
