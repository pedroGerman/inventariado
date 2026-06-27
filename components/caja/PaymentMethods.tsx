"use client";

import { Banknote, CreditCard, Landmark, Plus } from "lucide-react";

import { CardTypeSelector } from "@/components/caja/CardTypeSelector";
import { SelectableButtonGroup } from "@/components/ui/SelectableButtonGroup";
import type { PaymentMethod } from "@/lib/types/database";
import {
  getCardType,
  getPaymentMethodCategory,
  resolvePaymentMethod,
  type CardType,
  type PaymentMethodCategory,
} from "@/lib/utils/paymentMethod";

const methods: {
  id: PaymentMethodCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "cash", label: "Efectivo", icon: <Banknote className="h-5 w-5 shrink-0" /> },
  {
    id: "transfer",
    label: "Transferencia",
    icon: <Landmark className="h-5 w-5 shrink-0" />,
  },
  {
    id: "card",
    label: "Tarjeta",
    icon: <CreditCard className="h-5 w-5 shrink-0" />,
  },
  { id: "other", label: "Otros", icon: <Plus className="h-5 w-5 shrink-0" /> },
];

interface PaymentMethodsProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethods({ selected, onSelect }: PaymentMethodsProps) {
  const category = getPaymentMethodCategory(selected);
  const cardType = getCardType(selected);

  function handleCategoryChange(next: PaymentMethodCategory) {
    onSelect(resolvePaymentMethod(next, cardType));
  }

  function handleCardTypeChange(next: CardType) {
    onSelect(resolvePaymentMethod("card", next));
  }

  return (
    <div className="flex flex-col gap-5">
      <SelectableButtonGroup
        aria-label="Método de pago"
        value={category}
        onChange={handleCategoryChange}
        options={methods.map((method) => ({
          value: method.id,
          label: method.label,
          icon: method.icon,
        }))}
      />
      {category === "card" ? (
        <CardTypeSelector value={cardType} onChange={handleCardTypeChange} />
      ) : null}
    </div>
  );
}
