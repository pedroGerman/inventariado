"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth/actions";
import { isMockMode } from "@/lib/config";
import { AuthFooterLink, AuthScreen } from "@/components/auth/AuthScreen";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";

export default function OlvideContrasenaPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mock = isMockMode();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || success) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(
      result?.success ??
        "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña.",
    );
    setLoading(false);
  }

  return (
    <AuthScreen
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace a tu correo"
      showBack
      backHref="/login"
      footer={
        <AuthFooterLink
          prompt="¿La recordaste?"
          linkLabel="Volver a iniciar sesión"
          href="/login"
        />
      }
    >
      {mock && (
        <div className="mb-5 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Modo demo — la recuperación por correo no está disponible.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField
          id="email"
          name="email"
          type="email"
          label="Correo"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          disabled={!!success || mock}
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-[var(--button-success)]">
            {success}
          </p>
        )}

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={loading}
          disabled={loading || !!success || mock}
          className="rounded-xl disabled:opacity-40"
        >
          Enviar enlace
        </Button>
      </form>
    </AuthScreen>
  );
}
