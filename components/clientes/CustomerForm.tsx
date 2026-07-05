"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { TextField, Textarea } from "@/components/ui/Input";
import { PhoneField } from "@/components/ui/PhoneField";
import {
  saveCustomer,
  saveSupplier,
  newEntityId,
  getActiveBusinessId,
} from "@/lib/mock/db";
import type { Customer, Supplier } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";
import { normalizePhoneForSave } from "@/lib/utils/phone";

interface CustomerFormProps {
  mode: "customer" | "supplier";
  backHref: string;
  returnTo?: string;
  openDrawerOnReturn?: boolean;
  customer?: Customer;
  supplier?: Supplier;
}

export function CustomerForm({
  mode,
  backHref,
  returnTo,
  openDrawerOnReturn = false,
  customer,
  supplier,
}: CustomerFormProps) {
  const router = useRouter();
  const isEdit = Boolean(customer || supplier);
  const [name, setName] = useState(customer?.name ?? supplier?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? supplier?.phone ?? "");
  const [extra, setExtra] = useState(customer?.extra_info ?? "");
  const [nit, setNit] = useState(supplier?.nit ?? "");
  const [showExtra, setShowExtra] = useState(Boolean(customer?.extra_info));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCustomer = mode === "customer";
  const title = isCustomer
    ? isEdit
      ? "Editar Cliente"
      : "Nuevo Cliente"
    : isEdit
      ? "Editar Proveedor"
      : "Nuevo Proveedor";

  async function handleSave() {
    if (!name.trim() || saving) return;

    setSaving(true);
    setError(null);

    try {
      if (isCustomer) {
        const nextCustomer: Customer = {
          id: customer?.id ?? newEntityId(),
          business_id: customer?.business_id ?? getActiveBusinessId(),
          name: name.trim(),
          phone: normalizePhoneForSave(phone),
          extra_info: extra || null,
          created_at: customer?.created_at ?? new Date().toISOString(),
        };
        await saveCustomer(nextCustomer);

        if (returnTo) {
          const params = new URLSearchParams();
          if (openDrawerOnReturn) {
            params.set("openCustomerDrawer", "1");
            params.set("customerId", nextCustomer.id);
          }
          const query = params.toString();
          router.push(query ? `${returnTo}?${query}` : returnTo);
          return;
        }
      } else {
        const nextSupplier: Supplier = {
          id: supplier?.id ?? newEntityId(),
          business_id: supplier?.business_id ?? getActiveBusinessId(),
          name: name.trim(),
          phone: normalizePhoneForSave(phone),
          nit: nit || null,
          created_at: supplier?.created_at ?? new Date().toISOString(),
        };
        await saveSupplier(nextSupplier);

        if (returnTo) {
          const params = new URLSearchParams();
          if (openDrawerOnReturn) {
            params.set("openSupplierDrawer", "1");
            params.set("supplierId", nextSupplier.id);
          }
          const query = params.toString();
          router.push(query ? `${returnTo}?${query}` : returnTo);
          return;
        }
      }

      router.push(backHref);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el contacto.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header title={title} showBack backHref={backHref} />

      <div className="flex flex-col gap-4 px-4 py-4 pb-28">
        <TextField
          label="Nombre *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre completo"
          className="text-sm"
          labelClassName="!text-sm"
        />

        <PhoneField value={phone} onChange={setPhone} />

        {!isCustomer && (
          <TextField
            label="NIT"
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            placeholder="Número de identificación tributaria"
            className="text-sm"
          />
        )}

        {isCustomer && (
          <>
            <button
              type="button"
              onClick={() => setShowExtra(!showExtra)}
              className="text-left text-sm font-medium text-[var(--button-success)]"
            >
              + Incluye más información (opcional)
            </button>
            {showExtra && (
              <Textarea
                label="Información adicional"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                rows={3}
                placeholder="Notas adicionales..."
                className="text-sm"
              />
            )}
          </>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      <div
        className={cn(
          "fixed bottom-20 left-0 right-0 z-10 mx-auto max-w-mobile border-t border-border/50 bg-surface-0 px-4 py-4 safe-bottom",
        )}
      >
        <Button
          fullWidth
          variant="success"
          disabled={!name.trim() || saving}
          loading={saving}
          onClick={() => void handleSave()}
        >
          Guardar
        </Button>
      </div>
    </>
  );
}
