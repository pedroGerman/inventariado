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
}

interface CartStore {
  mode: CartMode;
  items: CartItem[];
  setMode: (mode: CartMode) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      mode: "sale",
      items: [],

      setMode: (mode) => set({ mode }),

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product_id === item.product_id &&
              i.product_id !== null &&
              i.type === item.type,
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
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

          return { items: [...state.items, item] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity, total_price: quantity * i.unit_price }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.total_price, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: "pos-cart" },
  ),
);
