"use client";

import { useRouter } from "next/navigation";
import {
  deletePendingOrder,
  deletePendingPurchase,
} from "@/lib/services/orderActions";
import { useCartStore, type CartMode } from "@/lib/store/cart";

function useDeletePending(mode: CartMode, redirectHref: string) {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const getPendingId = useCartStore((s) => s.getPendingId);

  async function remove(id: string) {
    if (mode === "sale") {
      await deletePendingOrder(id);
    } else {
      await deletePendingPurchase(id);
    }

    if (getPendingId(mode) === id) {
      clearCart(mode);
    }

    router.push(redirectHref);
  }

  return { remove };
}

export function useDeletePendingSaleOrder() {
  return useDeletePending("sale", "/ordenes?pending=1");
}

export function useDeletePendingPurchaseOrder() {
  return useDeletePending("purchase", "/ordenes?tab=purchase&pending=1");
}
