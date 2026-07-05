"use client";

import { create } from "zustand";
import type { Customer, PaymentMethod, PaymentType, Supplier } from "@/lib/types/database";
import type { DiscountType } from "@/lib/utils/discount";
import { computeDiscountAmount } from "@/lib/utils/discount";

interface CheckoutStore {
  customer: Customer | null;
  supplier: Supplier | null;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  includeDiscount: boolean;
  discountType: DiscountType;
  discountValue: number;
  tax: number;
  setCustomer: (customer: Customer | null) => void;
  setSupplier: (supplier: Supplier | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPaymentType: (type: PaymentType) => void;
  applyDiscount: (type: DiscountType, value: number) => void;
  clearDiscount: () => void;
  getDiscountAmount: (subtotal: number) => number;
  setTax: (v: number) => void;
  reset: () => void;
}

const initial = {
  customer: null as Customer | null,
  supplier: null as Supplier | null,
  paymentMethod: "cash" as PaymentMethod,
  paymentType: "pay_all" as PaymentType,
  includeDiscount: false,
  discountType: "percent" as DiscountType,
  discountValue: 0,
  tax: 0,
};

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  ...initial,
  setCustomer: (customer) => set({ customer }),
  setSupplier: (supplier) => set({ supplier }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setPaymentType: (paymentType) => set({ paymentType }),
  applyDiscount: (discountType, discountValue) =>
    set({ includeDiscount: true, discountType, discountValue }),
  clearDiscount: () =>
    set({ includeDiscount: false, discountType: "percent", discountValue: 0 }),
  getDiscountAmount: (subtotal) => {
    const state = get();
    if (!state.includeDiscount) return 0;
    return computeDiscountAmount(subtotal, state.discountType, state.discountValue);
  },
  setTax: (tax) => set({ tax }),
  reset: () => set(initial),
}));
