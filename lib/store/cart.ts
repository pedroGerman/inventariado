"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartMode = "sale" | "purchase";

export interface CartItem {
  id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  type: "product" | "quick_sale" | "quick_purchase";
  image_url?: string | null;
}

type ItemsKey = "saleItems" | "purchaseItems";

function itemsKey(mode: CartMode): ItemsKey {
  return mode === "sale" ? "saleItems" : "purchaseItems";
}

function sumTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.total_price, 0);
}

function sumCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function pendingKey(mode: CartMode): "pendingSaleOrderId" | "pendingPurchaseId" {
  return mode === "sale" ? "pendingSaleOrderId" : "pendingPurchaseId";
}

interface CartStore {
  saleItems: CartItem[];
  purchaseItems: CartItem[];
  pendingSaleOrderId: string | null;
  pendingPurchaseId: string | null;
  addItem: (item: CartItem, mode: CartMode) => void;
  removeItem: (id: string, mode: CartMode) => void;
  updateQuantity: (id: string, quantity: number, mode: CartMode) => void;
  clearCart: (mode: CartMode) => void;
  clearPendingLink: (mode: CartMode) => void;
  loadPending: (items: CartItem[], pendingId: string, mode: CartMode) => void;
  replaceItems: (items: CartItem[], mode: CartMode) => void;
  getPendingId: (mode: CartMode) => string | null;
  getItems: (mode: CartMode) => CartItem[];
  getTotal: (mode: CartMode) => number;
  getItemCount: (mode: CartMode) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      saleItems: [],
      purchaseItems: [],
      pendingSaleOrderId: null,
      pendingPurchaseId: null,

      getItems: (mode) => get()[itemsKey(mode)],

      getPendingId: (mode) => get()[pendingKey(mode)],

      loadPending: (items, pendingId, mode) => {
        set({
          [itemsKey(mode)]: items,
          [pendingKey(mode)]: pendingId,
        });
      },

      replaceItems: (items, mode) => {
        set({
          [itemsKey(mode)]: items,
          [pendingKey(mode)]: null,
        });
      },

      addItem: (item, mode) => {
        const key = itemsKey(mode);
        set((state) => {
          const current = state[key];
          const existing = current.find(
            (i) =>
              i.product_id === item.product_id &&
              i.product_id !== null &&
              i.type === item.type,
          );

          if (existing) {
            return {
              [key]: current.map((i) =>
                i.id === existing.id
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                      total_price: (i.quantity + item.quantity) * i.unit_price,
                    }
                  : i,
              ),
            };
          }

          return { [key]: [...current, item] };
        });
      },

      removeItem: (id, mode) => {
        const key = itemsKey(mode);
        set((state) => ({
          [key]: state[key].filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity, mode) => {
        if (quantity <= 0) {
          get().removeItem(id, mode);
          return;
        }

        const key = itemsKey(mode);
        set((state) => ({
          [key]: state[key].map((i) =>
            i.id === id
              ? { ...i, quantity, total_price: quantity * i.unit_price }
              : i,
          ),
        }));
      },

      clearCart: (mode) => {
        set({
          [itemsKey(mode)]: [],
          [pendingKey(mode)]: null,
        });
      },

      clearPendingLink: (mode) => {
        set({ [pendingKey(mode)]: null });
      },

      getTotal: (mode) => sumTotal(get()[itemsKey(mode)]),

      getItemCount: (mode) => sumCount(get()[itemsKey(mode)]),
    }),
    {
      name: "pos-cart",
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as Record<string, unknown> | undefined;
        if (!state) {
          return {
            saleItems: [],
            purchaseItems: [],
            pendingSaleOrderId: null,
            pendingPurchaseId: null,
          };
        }

        if (version === 0 || version === 1) {
          if ("saleItems" in state && "purchaseItems" in state) {
            return {
              ...state,
              pendingSaleOrderId: null,
              pendingPurchaseId: null,
            };
          }

          const oldItems = (state.items as CartItem[]) ?? [];
          const oldMode = (state.mode as CartMode) ?? "sale";
          return {
            saleItems: oldMode === "sale" ? oldItems : [],
            purchaseItems: oldMode === "purchase" ? oldItems : [],
            pendingSaleOrderId: null,
            pendingPurchaseId: null,
          };
        }

        return persistedState;
      },
    },
  ),
);
