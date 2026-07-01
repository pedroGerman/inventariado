"use client";

import { useEffect, useState } from "react";
import { createBusiness } from "@/lib/business/actions";
import { logout } from "@/lib/auth/actions";
import { clearStaleLocalData } from "@/lib/client/clearStaleLocalData";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { SelectField, SelectItem } from "@/components/ui/Select";
import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY,
} from "@/lib/constants/currencies";
import { cn } from "@/lib/utils/cn";

function ReadOnlyField({
  label,
  value,
  helperText,
  className,
}: {
  label: string;
  value: string;
  helperText: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs font-medium text-slate-700">{label}</p>
      <div className="rounded-md bg-input-surface px-3 py-2.5 text-sm font-medium text-card-foreground shadow-input-edge">
        {value}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{helperText}</p>
    </div>
  );
}

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    clearStaleLocalData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createBusiness(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-mobile flex-col bg-white">
      <header className="shrink-0 px-4 pb-4 pt-6 text-center border-b-2 border-slate-200">
        <h1 className="text-base font-semibold tracking-tight text-card-foreground">
          Información de tu tienda
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 pb-5 pt-7 flex-col"
      >
        <div className="flex-1 flex flex-col gap-5 px-4">
          <section className="">
            <TextField
              id="name"
              name="name"
              label="Nombre de la tienda"
              required
              placeholder="Ej. Mini Market La Fe"
              autoFocus
              autoComplete="organization"
              className="h-9 text-sm"
              helperText="Así se mostrará en la app, recibos y reportes."
            />
          </section>

          <section className="">
            <ReadOnlyField
              label="Impuesto (IVA)"
              value="18%"
              helperText="Tasa configurada para República Dominicana. Podrás ajustarla más adelante."
            />
          </section>

          <section className="">
            <input type="hidden" name="currency" value={currency} />
            <SelectField
              id="currency"
              label="Moneda"
              labelClassName="mb-1.5 text-xs"
              value={currency}
              onValueChange={setCurrency}
              triggerClassName="text-sm"
              helperText="Todas las ventas y reportes usarán esta moneda."
            >
              {CURRENCY_OPTIONS.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectField>
          </section>
        </div>

        <div className="sticky bottom-0 shrink-0 border-t border-border/50 bg-white px-4 py-4 safe-bottom">
          {error && (
            <p className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="success"
            fullWidth
            size="sm"
            loading={loading}
            className="!py-5 !rounded-lg"
          >
            Confirmar
          </Button>

          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            Revisa que el nombre sea correcto antes de continuar.
          </p>
        </div>
      </form>

      <div className="px-4 pb-6">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          size="sm"
          className="!py-5 !rounded-lg"
          onClick={() => {
            void logout();
          }}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
