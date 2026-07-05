"use client";

import {
  cancelConfirmedOrder,
  cancelConfirmedPurchase,
} from "@/lib/services/orderActions";

export function useCancelConfirmedSaleOrder() {
  async function cancel(orderId: string) {
    await cancelConfirmedOrder(orderId);
  }

  return { cancel };
}

export function useCancelConfirmedPurchaseOrder() {
  async function cancel(purchaseId: string) {
    await cancelConfirmedPurchase(purchaseId);
  }

  return { cancel };
}
