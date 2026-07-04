"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { AvatarImagePicker } from "@/components/ui/AvatarImagePicker";
import {
  getAccountProfile,
  getBusiness,
  saveAccountProfile,
  saveBusiness,
} from "@/lib/mock/db";
import { isMockMode } from "@/lib/config";
import { saveProfile } from "@/lib/profile/actions";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { useEmployeeStore } from "@/lib/store/employee";

function slugifyUsername(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

export default function EditarCuentaPage() {
  useMockDBRefresh();
  const router = useRouter();
  const currentEmployee = useEmployeeStore((s) => s.current);
  const setCurrentEmployee = useEmployeeStore((s) => s.setCurrent);

  const initialAccount = getAccountProfile();
  const initialBusiness = getBusiness();

  const [fullName, setFullName] = useState(initialAccount.full_name);
  const [email, setEmail] = useState(initialAccount.email);
  const [username, setUsername] = useState(initialAccount.username);
  const [phone, setPhone] = useState(initialAccount.phone ?? "");
  const [businessName, setBusinessName] = useState(initialBusiness.name);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialAccount.avatar_url,
  );
  const [saving, setSaving] = useState(false);

  const valid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    businessName.trim().length > 0;

  async function handleSave() {
    if (!valid || saving) return;

    setSaving(true);
    const trimmedName = fullName.trim();
    const trimmedUsername =
      username.trim() || slugifyUsername(trimmedName) || "usuario";

    const profilePayload = {
      full_name: trimmedName,
      email: email.trim(),
      username: trimmedUsername,
      phone: phone.trim() || null,
      avatar_url: avatarUrl,
    };

    if (isMockMode()) {
      saveAccountProfile({
        ...initialAccount,
        ...profilePayload,
      });
    } else {
      const result = await saveProfile(profilePayload);
      if (result.error) {
        setSaving(false);
        return;
      }
    }

    saveBusiness({
      ...initialBusiness,
      name: businessName.trim(),
    });

    if (currentEmployee) {
      setCurrentEmployee({
        ...currentEmployee,
        name: trimmedName,
      });
    }

    router.push("/opciones");
  }

  return (
    <>
      <Header title="Editar perfil" showBack backHref="/opciones" />

      <div className="flex flex-col gap-6 px-4 pb-7 pt-5">
        <section className="flex flex-col items-center gap-3 text-center">
          <AvatarImagePicker
            imageUrl={avatarUrl}
            onChange={setAvatarUrl}
            userId={initialAccount.user_id}
            fallbackLabel={fullName.trim() || "U"}
          />

          <div className="space-y-1">
            <p className="text-lg font-bold text-slate-900">
              {fullName.trim() || "Tu nombre"}
            </p>
            <p className="text-sm text-muted-foreground">
              @{username.trim() || slugifyUsername(fullName) || "usuario"}
            </p>
          </div>
        </section>

        <hr className="border-border/50" />

        <section className="flex flex-col gap-7">
          <TextField
            label="Nombre completo"
            className="h-11 rounded-lg text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            autoComplete="name"
          />

          <TextField
            label="Correo electrónico"
            type="email"
            className="h-11 rounded-lg text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
          />

          <TextField
            label="Teléfono"
            type="tel"
            className="h-11 rounded-lg text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Opcional"
            autoComplete="tel"
          />

          <TextField
            label="Usuario"
            className="h-11 rounded-lg text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="nombreusuario"
            autoComplete="username"
          />

          <TextField
            label="Nombre del negocio"
            className="h-11 rounded-lg text-sm"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Nombre de tu tienda"
          />
        </section>
      </div>

      <div className="mx-auto max-w-mobile px-4 ">
        <Button
          variant="success"
          fullWidth
          className="rounded-full py-3 text-sm font-bold"
          disabled={!valid || saving}
          loading={saving}
          onClick={handleSave}
        >
          Guardar
        </Button>
      </div>
    </>
  );
}
