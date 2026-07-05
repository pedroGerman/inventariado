import { isMockMode } from "@/lib/config";
import {
  adjustStock,
  deleteOrder,
  deletePurchase,
  getDebtByOrderId,
  getDebtByPurchaseId,
  getOrder,
  getPurchase,
  refreshDataStore,
  updateDebt,
  updateOrder,
  updatePurchase,
} from "@/lib/data/store";

export async function deletePendingOrder(orderId: string): Promise<void> {
  const order = getOrder(orderId);
  if (!order) {
    throw new Error("Orden no encontrada.");
  }
  if (order.status !== "pending") {
    throw new Error("Solo se pueden eliminar órdenes pendientes.");
  }

  await deleteOrder(orderId);
}

export async function deletePendingPurchase(purchaseId: string): Promise<void> {
  const purchase = getPurchase(purchaseId);
  if (!purchase) {
    throw new Error("Compra no encontrada.");
  }
  if (purchase.status !== "pending") {
    throw new Error("Solo se pueden eliminar compras pendientes.");
  }

  await deletePurchase(purchaseId);
}

async function closeLinkedDebt(orderId?: string, purchaseId?: string): Promise<void> {
  const debt = orderId
    ? getDebtByOrderId(orderId)
    : purchaseId
      ? getDebtByPurchaseId(purchaseId)
      : undefined;

  if (!debt || debt.remaining <= 0) return;

  await updateDebt(debt.id, {
    remaining: 0,
    status: "paid",
  });
}

async function revertSaleStock(orderId: string): Promise<void> {
  const order = getOrder(orderId);
  if (!order?.items?.length) return;

  await Promise.all(
    order.items.map((item) =>
      item.product_id
        ? adjustStock(item.product_id, item.quantity)
        : Promise.resolve(),
    ),
  );
}

async function revertPurchaseStock(purchaseId: string): Promise<void> {
  const purchase = getPurchase(purchaseId);
  if (!purchase?.items?.length) return;

  await Promise.all(
    purchase.items.map((item) =>
      item.product_id
        ? adjustStock(item.product_id, -item.quantity)
        : Promise.resolve(),
    ),
  );
}

export async function cancelConfirmedOrder(orderId: string): Promise<void> {
  const order = getOrder(orderId);
  if (!order) {
    throw new Error("Orden no encontrada.");
  }
  if (order.status !== "confirmed") {
    throw new Error("Solo se pueden anular órdenes confirmadas.");
  }

  await closeLinkedDebt(orderId, undefined);

  await updateOrder({
    ...order,
    status: "cancelled",
  });

  if (isMockMode()) {
    await revertSaleStock(orderId);
    return;
  }

  await refreshDataStore();
}

export async function cancelConfirmedPurchase(purchaseId: string): Promise<void> {
  const purchase = getPurchase(purchaseId);
  if (!purchase) {
    throw new Error("Compra no encontrada.");
  }
  if (purchase.status !== "confirmed") {
    throw new Error("Solo se pueden anular compras confirmadas.");
  }

  await closeLinkedDebt(undefined, purchaseId);

  await updatePurchase({
    ...purchase,
    status: "cancelled",
  });

  if (isMockMode()) {
    await revertPurchaseStock(purchaseId);
    return;
  }

  await refreshDataStore();
}
