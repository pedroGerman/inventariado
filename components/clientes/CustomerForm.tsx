"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { TextField, Textarea } from "@/components/ui/Input";
import { PhoneField } from "@/components/ui/PhoneField";
import { saveCustomer, saveSupplier, uid } from "@/lib/mock/db";
import { MOCK_BUSINESS_ID } from "@/lib/mock/seed";
import type { Customer, Supplier } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";
import { normalizePhoneForSave } from "@/lib/utils/phone";

interface CustomerFormProps {
  mode: "customer" | "supplier";
  backHref: string;
  returnTo?: string;
  openDrawerOnReturn?: boolean;
}

export function CustomerForm({
  mode,
  backHref,
  returnTo,
  openDrawerOnReturn = false,
}: CustomerFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [extra, setExtra] = useState("");
  const [nit, setNit] = useState("");
  const [showExtra, setShowExtra] = useState(false);

  const isCustomer = mode === "customer";
  const title = isCustomer ? "Nuevo Cliente" : "Nuevo Proveedor";

  function handleSave() {
    if (!name.trim()) return;

    if (isCustomer) {
      const customer: Customer = {
        id: uid("cust"),
        business_id: MOCK_BUSINESS_ID,
        name: name.trim(),
        phone: normalizePhoneForSave(phone),
        extra_info: extra || null,
        created_at: new Date().toISOString(),
      };
      saveCustomer(customer);

      if (returnTo) {
        const params = new URLSearchParams();
        if (openDrawerOnReturn) {
          params.set("openCustomerDrawer", "1");
          params.set("customerId", customer.id);
        }
        const query = params.toString();
        router.push(query ? `${returnTo}?${query}` : returnTo);
        return;
      }
    } else {
      const supplier: Supplier = {
        id: uid("sup"),
        business_id: MOCK_BUSINESS_ID,
        name: name.trim(),
        phone: normalizePhoneForSave(phone),
        nit: nit || null,
        created_at: new Date().toISOString(),
      };
      saveSupplier(supplier);

      if (returnTo) {
        const params = new URLSearchParams();
        if (openDrawerOnReturn) {
          params.set("openSupplierDrawer", "1");
          params.set("supplierId", supplier.id);
        }
        const query = params.toString();
        router.push(query ? `${returnTo}?${query}` : returnTo);
        return;
      }
    }

    router.push(backHref);
  }

  return (
    <>
      <Header title={title} showBack backHref={backHref} />

      <div className="flex flex-col gap-4 px-4 py-4 pb-28">
        {/* {isCustomer && (
          <Button variant="secondary" fullWidth disabled>
            Buscar contacto telefónico
          </Button>
        )} */}

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
      </div>

      <div
        className={cn(
          "fixed bottom-20 left-0 right-0 z-10 mx-auto max-w-mobile border-t border-border/50 bg-surface-0 px-4 py-4 safe-bottom",
        )}
      >
        <Button
          fullWidth
          variant="success"
          disabled={!name.trim()}
          onClick={handleSave}
        >
          Guardar
        </Button>
      </div>
    </>
  );
}
