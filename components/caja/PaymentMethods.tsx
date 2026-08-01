"use client";

import { useState } from "react";
import { Banknote, CreditCard, Landmark, Plus, Wallet } from "lucide-react";

import { CardTypeSelector } from "@/components/caja/CardTypeSelector";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { SelectableButtonGroup } from "@/components/ui/SelectableButtonGroup";
import {
  getActiveBusinessId,
  getCustomPaymentMethods,
  newEntityId,
  saveCustomPaymentMethod,
} from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import type { CustomPaymentMethod, PaymentMethod } from "@/lib/types/database";
import {
  getCardType,
  getPaymentMethodCategory,
  isReservedPaymentMethodName,
  resolvePaymentMethod,
  type CardType,
} from "@/lib/utils/paymentMethod";

type SelectionValue = "cash" | "transfer" | "card" | "other" | `custom:${string}`;

const builtinMethods: {
  id: Exclude<SelectionValue, `custom:${string}`>;
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

function selectionFromPaymentMethod(
  selected: PaymentMethod,
  customs: CustomPaymentMethod[],
): SelectionValue {
  const category = getPaymentMethodCategory(selected);
  if (category === "card") return "card";
  if (category === "custom") {
    const match = customs.find(
      (method) => method.name.toLowerCase() === selected.toLowerCase(),
    );
    if (match) return `custom:${match.id}`;
    return "other";
  }
  return category;
}

export function PaymentMethods({ selected, onSelect }: PaymentMethodsProps) {
  useMockDBRefresh();
  const customs = getCustomPaymentMethods();
  const selection = selectionFromPaymentMethod(selected, customs);
  const cardType = getCardType(selected);
  const [newMethodName, setNewMethodName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = [
    ...builtinMethods.slice(0, 3).map((method) => ({
      value: method.id as SelectionValue,
      label: method.label,
      icon: method.icon,
    })),
    ...customs.map((method) => ({
      value: `custom:${method.id}` as SelectionValue,
      label: method.name,
      icon: <Wallet className="h-5 w-5 shrink-0" />,
    })),
    {
      value: "other" as SelectionValue,
      label: "Otros",
      icon: <Plus className="h-5 w-5 shrink-0" />,
    },
  ];

  function handleSelectionChange(next: SelectionValue) {
    setError(null);
    if (next === "cash" || next === "transfer" || next === "other") {
      onSelect(resolvePaymentMethod(next));
      return;
    }
    if (next === "card") {
      onSelect(resolvePaymentMethod("card", cardType));
      return;
    }
    const id = next.slice("custom:".length);
    const method = customs.find((item) => item.id === id);
    if (method) onSelect(method.name);
  }

  function handleCardTypeChange(next: CardType) {
    onSelect(resolvePaymentMethod("card", next));
  }

  async function handleCreateMethod() {
    const name = newMethodName.trim();
    if (!name || saving) return;

    if (isReservedPaymentMethodName(name)) {
      setError("Ese nombre ya está reservado. Elige otro.");
      return;
    }

    const duplicate = customs.some(
      (method) => method.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      setError("Ya existe un método con ese nombre.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const method: CustomPaymentMethod = {
        id: newEntityId(),
        business_id: getActiveBusinessId(),
        name,
        active: true,
        created_at: new Date().toISOString(),
      };
      await saveCustomPaymentMethod(method);
      setNewMethodName("");
      onSelect(method.name);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el método de pago.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <SelectableButtonGroup
        aria-label="Método de pago"
        value={selection}
        onChange={handleSelectionChange}
        options={options}
      />
      {selection === "card" ? (
        <CardTypeSelector value={cardType} onChange={handleCardTypeChange} />
      ) : null}
      {selection === "other" ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TextField
              value={newMethodName}
              onChange={(e) => {
                setNewMethodName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Nuevo método de pago"
              className="min-w-0 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleCreateMethod();
                }
              }}
            />
            <Button
              type="button"
              variant="success"
              size="default"
              disabled={!newMethodName.trim() || saving}
              onClick={() => void handleCreateMethod()}
              className="h-9 shrink-0 px-4 !rounded-md"
            >
              {saving ? "..." : "Agregar"}
            </Button>
          </div>
          {error ? (
            <p className="px-0.5 text-xs text-destructive">{error}</p>
          ) : (
            <p className="px-0.5 text-xs text-muted-foreground">
              Se guardará para este negocio y aparecerá en la lista.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
