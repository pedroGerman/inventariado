"use client";

import { Banknote, CreditCard, Plus } from "lucide-react";

import { SelectableButtonGroup } from "@/components/ui/SelectableButtonGroup";
import type { PaymentMethod } from "@/lib/types/database";

const methods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: "cash", label: "Efectivo", icon: <Banknote className="h-5 w-5 shrink-0" /> },
  {
    id: "credit_card",
    label: "Tarjeta crédito",
    icon: <CreditCard className="h-5 w-5 shrink-0" />,
  },
  {
    id: "debit_card",
    label: "Tarjeta débito",
    icon: <CreditCard className="h-5 w-5 shrink-0" />,
  },
  { id: "other", label: "Otros", icon: <Plus className="h-5 w-5 shrink-0" /> },
];

interface PaymentMethodsProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethods({ selected, onSelect }: PaymentMethodsProps) {
  return (
    <SelectableButtonGroup
      aria-label="Método de pago"
      value={selected}
      onChange={onSelect}
      options={methods.map((method) => ({
        value: method.id,
        label: method.label,
        icon: method.icon,
      }))}
    />
  );
}
