"use client";

import { useRouter } from "next/navigation";
import { getCustomers, getProducts, getSuppliers } from "@/lib/mock/db";
import { useCartStore } from "@/lib/store/cart";
import { useCheckoutStore } from "@/lib/store/checkout";
import { useCartReplaceConfirmStore } from "@/lib/store/cartReplaceConfirm";
import {
  cartItemsFromOrder,
  cartItemsFromPurchase,
} from "@/lib/utils/cartFromOrder";
import type { Order, Purchase } from "@/lib/types/database";
import type { CartMode } from "@/lib/store/cart";

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
        ? `Ya tienes ${itemCount} artículo${itemCount === 1 ? "" : "s"} en el carrito de venta. Al duplicar esta orden se perderán.`
        : `Ya tienes ${itemCount} artículo${itemCount === 1 ? "" : "s"} en el carrito de compra. Al duplicar esta orden se perderán.`,
    onConfirm: proceed,
  });
}

export function useDuplicateSaleOrder() {
  const router = useRouter();
  const replaceItems = useCartStore((s) => s.replaceItems);
  const checkout = useCheckoutStore();

  function duplicateNow(order: Order) {
    const products = getProducts();
    const items = cartItemsFromOrder(order, products);
    checkout.reset();
    replaceItems(items, "sale");

    if (order.customer_id) {
      const customer = getCustomers().find((c) => c.id === order.customer_id);
      checkout.setCustomer(customer ?? null);
    } else {
      checkout.setCustomer(null);
    }

    router.push("/ventas/carrito");
  }

  function duplicate(order: Order) {
    requestCartReplace("sale", () => duplicateNow(order), "sale");
  }

  return { duplicate };
}

export function useDuplicatePurchaseOrder() {
  const router = useRouter();
  const replaceItems = useCartStore((s) => s.replaceItems);
  const checkout = useCheckoutStore();

  function duplicateNow(purchase: Purchase) {
    const products = getProducts();
    const items = cartItemsFromPurchase(purchase, products);
    checkout.reset();
    replaceItems(items, "purchase");

    if (purchase.supplier_id) {
      const supplier = getSuppliers().find((s) => s.id === purchase.supplier_id);
      checkout.setSupplier(supplier ?? null);
    } else {
      checkout.setSupplier(null);
    }

    router.push("/compras/carrito");
  }

  function duplicate(purchase: Purchase) {
    requestCartReplace("purchase", () => duplicateNow(purchase), "purchase");
  }

  return { duplicate };
}
