"use client";

import { useState } from "react";
import { createBusiness } from "@/lib/business/actions";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createBusiness(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-mobile flex-col justify-center px-6 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[var(--button-success)] text-2xl font-bold text-white">
          POS
        </div>
        <h1 className="text-2xl font-bold text-card-foreground">Crea tu tienda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configura lo esencial para empezar a vender
        </p>
      </div>

      <Card className="gap-0 !py-0">
        <CardContent className="!px-5 !py-5">
          <form action={handleSubmit} className="space-y-4">
            <TextField
              id="name"
              name="name"
              label="Nombre de la tienda *"
              required
              placeholder="Ej. Tienda El Progreso"
              autoFocus
            />

            <p className="text-xs text-muted-foreground">
              IVA configurado al 18% (República Dominicana). Podrás ajustar más
              opciones después.
            </p>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" variant="success" fullWidth loading={loading}>
              Crear tienda
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
