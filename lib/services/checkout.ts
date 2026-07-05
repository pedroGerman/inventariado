import type { CartItem } from "@/lib/store/cart";
import type { Debt, Employee, Order, Purchase } from "@/lib/types/database";
import type { PaymentMethod, PaymentType } from "@/lib/types/database";
import { isMockMode } from "@/lib/config";
import { todayISO } from "@/lib/utils/date";
import { toQuoteNumber, toSavedNumber } from "@/lib/utils/pendingOrder";
import {
  computeSalePaymentAmounts,
  debtStatusFromAmounts,
} from "@/lib/utils/salePayment";
import {
  adjustStock,
  getActiveBusinessId,
  getBusiness,
  getOrder,
  getPurchase,
  newEntityId,
  nextOrderNumber,
  nextPurchaseNumber,
  refreshDataStore,
  saveDebt,
  saveOrder,
  savePurchase,
  updateOrder,
  updatePurchase,
} from "@/lib/data/store";

interface FinalizeSaleParams {
  items: CartItem[];
  employee: Employee;
  customerId: string | null;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  discount: number;
  service: number;
  tax: number;
  toPay?: number;
  cashReceived?: number;
  pendingOrderId?: string | null;
}

interface SavePendingSaleParams {
  items: CartItem[];
  employee: Employee;
  customerId?: string | null;
  isQuote: boolean;
  existingOrderId?: string | null;
}

export interface FinalizeSaleResult {
  order: Order;
  debt?: Debt;
}

async function applySaleStock(items: CartItem[]): Promise<void> {
  await Promise.all(
    items.map((item) =>
      item.product_id
        ? adjustStock(item.product_id, -item.quantity)
        : Promise.resolve(),
    ),
  );
}

async function applyPurchaseStock(items: CartItem[]): Promise<void> {
  await Promise.all(
    items.map((item) =>
      item.product_id
        ? adjustStock(item.product_id, item.quantity)
        : Promise.resolve(),
    ),
  );
}

async function syncStockAfterPendingFinalize(
  mode: "sale" | "purchase",
  items: CartItem[],
): Promise<void> {
  if (isMockMode()) {
    if (mode === "sale") {
      await applySaleStock(items);
    } else {
      await applyPurchaseStock(items);
    }
    return;
  }

  await refreshDataStore();
}

export async function finalizeSale(
  params: FinalizeSaleParams,
): Promise<FinalizeSaleResult> {
  if (!params.customerId) {
    throw new Error("Se requiere un cliente para finalizar la venta.");
  }

  const subtotal = params.items.reduce((s, i) => s + i.total_price, 0);
  const total = subtotal + params.tax + params.service - params.discount;
  const now = new Date().toISOString();
  const payment = computeSalePaymentAmounts(
    total,
    params.paymentType,
    params.paymentMethod,
    params.toPay ?? total,
    params.cashReceived,
  );

  const businessId = getActiveBusinessId() || getBusiness().id;

  if (params.pendingOrderId) {
    const existing = getOrder(params.pendingOrderId);
    if (!existing || existing.status !== "pending") {
      throw new Error("La orden pendiente ya no está disponible.");
    }

    const order: Order = {
      ...existing,
      customer_id: params.customerId,
      status: "confirmed",
      payment_method: params.paymentMethod,
      payment_type: params.paymentType,
      subtotal,
      tax: params.tax,
      service: params.service,
      discount: params.discount,
      total,
      date: todayISO(),
      cash_received: payment.cashReceived,
      change: payment.change,
      items: params.items.map((item) => ({
        id: newEntityId(),
        order_id: existing.id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    };

    await updateOrder(order);

    await syncStockAfterPendingFinalize("sale", params.items);

    let debt: Debt | undefined;
    if (payment.balanceDue > 0 && params.customerId) {
      debt = {
        id: newEntityId(),
        kind: "collect",
        order_id: order.id,
        purchase_id: null,
        customer_id: params.customerId,
        supplier_id: null,
        business_id: businessId,
        total,
        paid: payment.amountApplied,
        remaining: payment.balanceDue,
        status: debtStatusFromAmounts(total, payment.amountApplied),
        created_at: now,
      };
      await saveDebt(debt);
    }

    return { order, debt };
  }

  const orderId = newEntityId();
  const orderNumber = await nextOrderNumber(businessId);

  const order: Order = {
    id: orderId,
    business_id: businessId,
    employee_id: params.employee.id,
    customer_id: params.customerId,
    register_id: null,
    order_number: orderNumber,
    status: "confirmed",
    payment_method: params.paymentMethod,
    payment_type: params.paymentType,
    subtotal,
    tax: params.tax,
    service: params.service,
    discount: params.discount,
    total,
    date: todayISO(),
    created_at: now,
    cash_received: payment.cashReceived,
    change: payment.change,
    items: params.items.map((item) => ({
      id: newEntityId(),
      order_id: orderId,
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    })),
  };

  await saveOrder(order);

  await applySaleStock(params.items);

  let debt: Debt | undefined;
  if (payment.balanceDue > 0 && params.customerId) {
    debt = {
      id: newEntityId(),
      kind: "collect",
      order_id: orderId,
      purchase_id: null,
      customer_id: params.customerId,
      supplier_id: null,
      business_id: businessId,
      total,
      paid: payment.amountApplied,
      remaining: payment.balanceDue,
      status: debtStatusFromAmounts(total, payment.amountApplied),
      created_at: now,
    };
    await saveDebt(debt);
  }

  return { order, debt };
}

export async function savePendingSale(
  params: SavePendingSaleParams,
): Promise<Order> {
  const subtotal = params.items.reduce((s, i) => s + i.total_price, 0);
  const total = subtotal;
  const businessId = getActiveBusinessId() || getBusiness().id;
  const now = new Date().toISOString();

  if (params.existingOrderId) {
    const existing = getOrder(params.existingOrderId);
    if (!existing || existing.status !== "pending") {
      throw new Error("La orden pendiente ya no está disponible.");
    }

    const order: Order = {
      ...existing,
      order_number: params.isQuote
        ? toQuoteNumber(existing.order_number)
        : toSavedNumber(existing.order_number),
      customer_id: params.isQuote ? (params.customerId ?? null) : null,
      subtotal,
      total,
      date: todayISO(),
      items: params.items.map((item) => ({
        id: newEntityId(),
        order_id: existing.id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    };

    await updateOrder(order);
    return order;
  }

  const orderId = newEntityId();
  const baseNumber = await nextOrderNumber(businessId);
  const orderNumber = params.isQuote ? `COT-${baseNumber}` : baseNumber;

  const order: Order = {
    id: orderId,
    business_id: businessId,
    employee_id: params.employee.id,
    customer_id: params.isQuote ? (params.customerId ?? null) : null,
    register_id: null,
    order_number: orderNumber,
    status: "pending",
    payment_method: "cash",
    payment_type: "pay_all",
    subtotal,
    tax: 0,
    service: 0,
    discount: 0,
    total,
    date: todayISO(),
    created_at: now,
    items: params.items.map((item) => ({
      id: newEntityId(),
      order_id: orderId,
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    })),
  };

  await saveOrder(order);
  return order;
}

interface FinalizePurchaseParams {
  items: CartItem[];
  employee: Employee;
  supplierId: string | null;
  paymentMethod: PaymentMethod;
  paymentType: "pay_all" | "deposit" | "pay_later";
  discount: number;
  tax: number;
  toPay?: number;
  cashPaid?: number;
  pendingPurchaseId?: string | null;
}

interface SavePendingPurchaseParams {
  items: CartItem[];
  employee: Employee;
  supplierId?: string | null;
  isQuote: boolean;
  existingPurchaseId?: string | null;
}

export interface FinalizePurchaseResult {
  purchase: Purchase;
  debt?: Debt;
}

export async function finalizePurchase(
  params: FinalizePurchaseParams,
): Promise<FinalizePurchaseResult> {
  if (!params.supplierId) {
    throw new Error("Se requiere un proveedor para finalizar la compra.");
  }

  const subtotal = params.items.reduce((s, i) => s + i.total_price, 0);
  const total = subtotal + params.tax - params.discount;
  const now = new Date().toISOString();
  const payment = computeSalePaymentAmounts(
    total,
    params.paymentType,
    params.paymentMethod,
    params.toPay ?? total,
    params.cashPaid,
  );

  const businessId = getActiveBusinessId() || getBusiness().id;

  if (params.pendingPurchaseId) {
    const existing = getPurchase(params.pendingPurchaseId);
    if (!existing || existing.status !== "pending") {
      throw new Error("La compra pendiente ya no está disponible.");
    }

    const purchase: Purchase = {
      ...existing,
      supplier_id: params.supplierId,
      status: "confirmed",
      payment_method: params.paymentMethod,
      payment_type: params.paymentType,
      subtotal,
      tax: params.tax,
      discount: params.discount,
      total,
      date: todayISO(),
      cash_paid: payment.cashReceived,
      change: payment.change,
      items: params.items.map((item) => ({
        id: newEntityId(),
        purchase_id: existing.id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    };

    await updatePurchase(purchase);

    await syncStockAfterPendingFinalize("purchase", params.items);

    let debt: Debt | undefined;
    if (payment.balanceDue > 0 && params.supplierId) {
      debt = {
        id: newEntityId(),
        kind: "pay",
        order_id: null,
        purchase_id: purchase.id,
        customer_id: null,
        supplier_id: params.supplierId,
        business_id: businessId,
        total,
        paid: payment.amountApplied,
        remaining: payment.balanceDue,
        status: debtStatusFromAmounts(total, payment.amountApplied),
        created_at: now,
      };
      await saveDebt(debt);
    }

    return { purchase, debt };
  }

  const purchaseId = newEntityId();
  const purchaseNumber = await nextPurchaseNumber(businessId);

  const purchase: Purchase = {
    id: purchaseId,
    business_id: businessId,
    employee_id: params.employee.id,
    supplier_id: params.supplierId,
    register_id: null,
    purchase_number: purchaseNumber,
    status: "confirmed",
    payment_method: params.paymentMethod,
    payment_type: params.paymentType,
    subtotal,
    tax: params.tax,
    discount: params.discount,
    total,
    date: todayISO(),
    created_at: now,
    cash_paid: payment.cashReceived,
    change: payment.change,
    items: params.items.map((item) => ({
      id: newEntityId(),
      purchase_id: purchaseId,
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    })),
  };

  await savePurchase(purchase);

  await applyPurchaseStock(params.items);

  let debt: Debt | undefined;
  if (payment.balanceDue > 0 && params.supplierId) {
    debt = {
      id: newEntityId(),
      kind: "pay",
      order_id: null,
      purchase_id: purchaseId,
      customer_id: null,
      supplier_id: params.supplierId,
      business_id: businessId,
      total,
      paid: payment.amountApplied,
      remaining: payment.balanceDue,
      status: debtStatusFromAmounts(total, payment.amountApplied),
      created_at: now,
    };
    await saveDebt(debt);
  }

  return { purchase, debt };
}

export async function savePendingPurchase(
  params: SavePendingPurchaseParams,
): Promise<Purchase> {
  const subtotal = params.items.reduce((s, i) => s + i.total_price, 0);
  const total = subtotal;
  const businessId = getActiveBusinessId() || getBusiness().id;
  const now = new Date().toISOString();

  if (params.existingPurchaseId) {
    const existing = getPurchase(params.existingPurchaseId);
    if (!existing || existing.status !== "pending") {
      throw new Error("La compra pendiente ya no está disponible.");
    }

    const purchase: Purchase = {
      ...existing,
      purchase_number: params.isQuote
        ? toQuoteNumber(existing.purchase_number)
        : toSavedNumber(existing.purchase_number),
      supplier_id: params.isQuote ? (params.supplierId ?? null) : null,
      subtotal,
      total,
      date: todayISO(),
      items: params.items.map((item) => ({
        id: newEntityId(),
        purchase_id: existing.id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    };

    await updatePurchase(purchase);
    return purchase;
  }

  const purchaseId = newEntityId();
  const baseNumber = await nextPurchaseNumber(businessId);
  const purchaseNumber = params.isQuote ? `COT-${baseNumber}` : baseNumber;

  const purchase: Purchase = {
    id: purchaseId,
    business_id: businessId,
    employee_id: params.employee.id,
    supplier_id: params.isQuote ? (params.supplierId ?? null) : null,
    register_id: null,
    purchase_number: purchaseNumber,
    status: "pending",
    payment_method: "cash",
    payment_type: "pay_all",
    subtotal,
    tax: 0,
    discount: 0,
    total,
    date: todayISO(),
    created_at: now,
    items: params.items.map((item) => ({
      id: newEntityId(),
      purchase_id: purchaseId,
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    })),
  };

  await savePurchase(purchase);
  return purchase;
}
