import type { CartItem } from "@/lib/store/cart";
import type { Employee } from "@/lib/types/database";
import type { PaymentMethod, PaymentType } from "@/lib/types/database";
import { generateOrderNumber } from "@/lib/utils/generateOrderNumber";
import { todayISO } from "@/lib/utils/date";
import {
  adjustStock,
  saveDebt,
  saveOrder,
  savePurchase,
  uid,
} from "@/lib/mock/db";
import { MOCK_BUSINESS_ID, mockCashRegister } from "@/lib/mock/seed";

interface FinalizeSaleParams {
  items: CartItem[];
  employee: Employee;
  customerId: string | null;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  discount: number;
  service: number;
  tax: number;
  cashReceived?: number;
}

export function finalizeSale(params: FinalizeSaleParams) {
  const subtotal = params.items.reduce((s, i) => s + i.total_price, 0);
  const total = subtotal + params.tax + params.service - params.discount;
  const orderId = uid("ord");
  const now = new Date().toISOString();

  const order = {
    id: orderId,
    business_id: MOCK_BUSINESS_ID,
    employee_id: params.employee.id,
    customer_id: params.customerId,
    register_id: mockCashRegister.id,
    order_number: generateOrderNumber("sale"),
    status: "confirmed" as const,
    payment_method: params.paymentMethod,
    payment_type: params.paymentType,
    subtotal,
    tax: params.tax,
    service: params.service,
    discount: params.discount,
    total,
    date: todayISO(),
    created_at: now,
    cash_received: params.cashReceived,
    change: params.cashReceived ? Math.max(params.cashReceived - total, 0) : 0,
    items: params.items.map((item) => ({
      id: uid("oi"),
      order_id: orderId,
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    })),
  };

  saveOrder(order);

  params.items.forEach((item) => {
    if (item.product_id) adjustStock(item.product_id, -item.quantity);
  });

  if (params.paymentType === "pay_later" && params.customerId) {
    saveDebt({
      id: uid("debt"),
      order_id: orderId,
      customer_id: params.customerId,
      business_id: MOCK_BUSINESS_ID,
      total,
      paid: 0,
      remaining: total,
      status: "pending",
      created_at: now,
    });
  }

  return order;
}

interface FinalizePurchaseParams {
  items: CartItem[];
  employee: Employee;
  supplierId: string | null;
  paymentMethod: string;
  paymentType: "pay_all" | "deposit" | "pay_later";
  discount: number;
  tax: number;
}

export function finalizePurchase(params: FinalizePurchaseParams) {
  const subtotal = params.items.reduce((s, i) => s + i.total_price, 0);
  const total = subtotal + params.tax - params.discount;
  const purchaseId = uid("pur");
  const now = new Date().toISOString();

  const purchase = {
    id: purchaseId,
    business_id: MOCK_BUSINESS_ID,
    employee_id: params.employee.id,
    supplier_id: params.supplierId,
    register_id: mockCashRegister.id,
    purchase_number: generateOrderNumber("purchase"),
    status: "confirmed" as const,
    payment_method: params.paymentMethod,
    payment_type: params.paymentType,
    subtotal,
    tax: params.tax,
    discount: params.discount,
    total,
    date: todayISO(),
    created_at: now,
    items: params.items.map((item) => ({
      id: uid("pi"),
      purchase_id: purchaseId,
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    })),
  };

  savePurchase(purchase);

  params.items.forEach((item) => {
    if (item.product_id) adjustStock(item.product_id, item.quantity);
  });

  return purchase;
}
