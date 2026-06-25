"use client";

import { create } from "zustand";
import type { Customer, PaymentMethod, PaymentType, Supplier } from "@/lib/types/database";

interface CheckoutStore {
  customer: Customer | null;
  supplier: Supplier | null;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  includeDiscount: boolean;
  includeDelivery: boolean;
  discount: number;
  service: number;
  tax: number;
  setCustomer: (customer: Customer | null) => void;
  setSupplier: (supplier: Supplier | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPaymentType: (type: PaymentType) => void;
  setIncludeDiscount: (v: boolean) => void;
  setIncludeDelivery: (v: boolean) => void;
  setDiscount: (v: number) => void;
  setService: (v: number) => void;
  setTax: (v: number) => void;
  reset: () => void;
}

const initial = {
  customer: null as Customer | null,
  supplier: null as Supplier | null,
  paymentMethod: "cash" as PaymentMethod,
  paymentType: "pay_all" as PaymentType,
  includeDiscount: false,
  includeDelivery: false,
  discount: 0,
  service: 0,
  tax: 0,
};

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  ...initial,
  setCustomer: (customer) => set({ customer }),
  setSupplier: (supplier) => set({ supplier }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setPaymentType: (paymentType) => set({ paymentType }),
  setIncludeDiscount: (includeDiscount) => set({ includeDiscount }),
  setIncludeDelivery: (includeDelivery) => set({ includeDelivery }),
  setDiscount: (discount) => set({ discount }),
  setService: (service) => set({ service }),
  setTax: (tax) => set({ tax }),
  reset: () => set(initial),
}));
