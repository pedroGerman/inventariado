"use client";

import { useState } from "react";
import { signup } from "@/lib/auth/actions";
import { isPasswordValid } from "@/lib/auth/password";
import { isMockMode } from "@/lib/config";
import { AuthFooterLink, AuthScreen } from "@/components/auth/AuthScreen";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mock = isMockMode();

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    isPasswordValid(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || success) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(result.success);
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Crea tu cuenta para empezar"
      showBack
      backHref="/login"
      footer={
        <AuthFooterLink
          prompt="¿Ya tienes cuenta?"
          linkLabel="Iniciar sesión"
          href="/login"
        />
      }
    >
      {mock && (
        <div className="mb-5 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Modo demo — el registro te llevará directo a crear tu tienda.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField
          id="name"
          name="name"
          label="Nombre"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
        />

        <TextField
          id="email"
          name="email"
          type="email"
          label="Correo"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />

        <div className="space-y-3">
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            label="Contraseña"
          />
          <PasswordRequirements password={password} />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-[var(--button-success)]">
            {success}
          </p>
        )}

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={loading}
          disabled={!canSubmit || !!success}
          className="rounded-xl disabled:opacity-40"
        >
          Crear cuenta
        </Button>
      </form>
    </AuthScreen>
  );
}
