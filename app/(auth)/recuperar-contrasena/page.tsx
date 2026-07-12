"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordFromRecovery } from "@/lib/auth/actions";
import { isPasswordValid } from "@/lib/auth/password";
import { AuthFooterLink, AuthScreen } from "@/components/auth/AuthScreen";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { Button } from "@/components/ui/Button";

export default function RecuperarContrasenaPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    isPasswordValid(newPassword) &&
    newPassword === confirmPassword &&
    !success;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await updatePasswordFromRecovery(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(
      result?.success ?? "Tu contraseña se actualizó. Ya puedes iniciar sesión.",
    );
    setLoading(false);

    window.setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <AuthScreen
      title="Nueva contraseña"
      subtitle="Elige una contraseña segura para tu cuenta"
      footer={
        <AuthFooterLink
          prompt="¿Problemas con el enlace?"
          linkLabel="Solicitar uno nuevo"
          href="/olvide-contrasena"
        />
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-3">
          <PasswordField
            id="newPassword"
            name="newPassword"
            label="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <PasswordRequirements password={newPassword} />
        </div>

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Repite la nueva contraseña"
        />

        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-sm text-destructive">
            Las contraseñas no coinciden.
          </p>
        )}

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
          disabled={!canSubmit || loading}
          className="rounded-xl disabled:opacity-40"
        >
          Guardar contraseña
        </Button>
      </form>
    </AuthScreen>
  );
}
