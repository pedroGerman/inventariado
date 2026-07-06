"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/lib/auth/actions";
import { isPasswordValid } from "@/lib/auth/password";
import { isMockMode } from "@/lib/config";
import { Header } from "@/components/layout/Header";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { Button } from "@/components/ui/Button";

export default function CambiarContrasenaPage() {
  const router = useRouter();
  const mock = isMockMode();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    !mock &&
    currentPassword.length > 0 &&
    isPasswordValid(newPassword) &&
    newPassword === confirmPassword &&
    currentPassword !== newPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(result?.success ?? "Contraseña actualizada.");
    setLoading(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    window.setTimeout(() => {
      router.push("/opciones");
    }, 1500);
  }

  return (
    <>
      <Header
        title="Cambiar contraseña"
        showBack
        backHref="/opciones/cuenta/editar"
      />

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-col gap-6 px-4 py-5 pb-28"
      >
        {mock ? (
          <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
            Esta opción solo está disponible con cuenta en Supabase, no en modo
            demo.
          </p>
        ) : (
          <>
            <PasswordField
              id="currentPassword"
              name="currentPassword"
              label="Contraseña actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />

            <PasswordField
              id="newPassword"
              name="newPassword"
              label="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />

            <PasswordRequirements password={newPassword} />

            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Repite la nueva contraseña"
            />

            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-destructive">
                Las contraseñas nuevas no coinciden.
              </p>
            )}
          </>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-primary">
            {success}
          </p>
        )}

        {!mock && (
          <Button
            type="submit"
            variant="success"
            fullWidth
            className="rounded-full py-3 text-sm font-bold"
            disabled={!canSubmit || loading}
            loading={loading}
          >
            Actualizar contraseña
          </Button>
        )}
      </form>
    </>
  );
}
