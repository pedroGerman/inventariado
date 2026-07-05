"use client";

import { create } from "zustand";

interface CartReplaceConfirmState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: (() => void) | null;
  request: (options: {
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }) => void;
  close: () => void;
}

export const useCartReplaceConfirmStore = create<CartReplaceConfirmState>(
  (set) => ({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Continuar",
    onConfirm: null,
    request: ({ title, description, confirmLabel = "Continuar", onConfirm }) =>
      set({
        open: true,
        title,
        description,
        confirmLabel,
        onConfirm,
      }),
    close: () =>
      set({
        open: false,
        onConfirm: null,
      }),
  }),
);
