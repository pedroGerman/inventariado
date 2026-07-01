"use client";

import { useEffect, useState } from "react";
import { login } from "@/lib/auth/actions";
import { isMockMode } from "@/lib/config";
import { clearStaleLocalData } from "@/lib/client/clearStaleLocalData";
import { AuthFooterLink, AuthScreen } from "@/components/auth/AuthScreen";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mock = isMockMode();

  useEffect(() => {
    if (!mock) clearStaleLocalData();
  }, [mock]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para continuar"
      footer={
        <AuthFooterLink
          prompt="¿No tienes cuenta?"
          linkLabel="Crear cuenta"
          href="/signup"
        />
      }
    >
      {mock && (
        <div className="mb-5 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Modo demo — cualquier email y contraseña funcionan.
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
          defaultValue={mock ? "demo@pos.app" : ""}
          placeholder="tu@email.com"
        />

        <PasswordField
          defaultValue={mock ? "demo123" : ""}
          autoComplete="current-password"
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={loading}
          disabled={loading}
          className="rounded-xl"
        >
          Iniciar sesión
        </Button>
      </form>
    </AuthScreen>
  );
}
