import type { CartItem } from "@/lib/store/cart";
import type { Debt, Employee, Order, Purchase } from "@/lib/types/database";
import type { PaymentMethod, PaymentType } from "@/lib/types/database";
import { todayISO } from "@/lib/utils/date";
import {
  computeSalePaymentAmounts,
  debtStatusFromAmounts,
} from "@/lib/utils/salePayment";
import {
  adjustStock,
  getActiveBusinessId,
  getBusiness,
  newEntityId,
  nextOrderNumber,
  nextPurchaseNumber,
  saveDebt,
  saveOrder,
  savePurchase,
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
}

export interface FinalizeSaleResult {
  order: Order;
  debt?: Debt;
}

export async function finalizeSale(
  params: FinalizeSaleParams,
): Promise<FinalizeSaleResult> {
  const subtotal = params.items.reduce((s, i) => s + i.total_price, 0);
  const total = subtotal + params.tax + params.service - params.discount;
  const orderId = newEntityId();
  const now = new Date().toISOString();
  const payment = computeSalePaymentAmounts(
    total,
    params.paymentType,
    params.paymentMethod,
    params.toPay ?? total,
    params.cashReceived,
  );

  const businessId = getActiveBusinessId() || getBusiness().id;
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

  await Promise.all(
    params.items.map((item) =>
      item.product_id
        ? adjustStock(item.product_id, -item.quantity)
        : Promise.resolve(),
    ),
  );

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
}

export interface FinalizePurchaseResult {
  purchase: Purchase;
  debt?: Debt;
}

export async function finalizePurchase(
  params: FinalizePurchaseParams,
): Promise<FinalizePurchaseResult> {
  const subtotal = params.items.reduce((s, i) => s + i.total_price, 0);
  const total = subtotal + params.tax - params.discount;
  const purchaseId = newEntityId();
  const now = new Date().toISOString();
  const payment = computeSalePaymentAmounts(
    total,
    params.paymentType,
    params.paymentMethod,
    params.toPay ?? total,
    params.cashPaid,
  );

  const businessId = getActiveBusinessId() || getBusiness().id;
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

  await Promise.all(
    params.items.map((item) =>
      item.product_id
        ? adjustStock(item.product_id, item.quantity)
        : Promise.resolve(),
    ),
  );

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
