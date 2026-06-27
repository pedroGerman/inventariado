"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import {
  getAccountProfile,
  getBusiness,
  saveAccountProfile,
  saveBusiness,
} from "@/lib/mock/db";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const valid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    businessName.trim().length > 0;

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleSave() {
    if (!valid) return;

    const trimmedName = fullName.trim();
    const trimmedUsername =
      username.trim() || slugifyUsername(trimmedName) || "usuario";

    saveAccountProfile({
      ...initialAccount,
      full_name: trimmedName,
      email: email.trim(),
      username: trimmedUsername,
      phone: phone.trim() || null,
      avatar_url: avatarUrl,
    });

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

      <div className="flex flex-col gap-6 px-4 pb-28 pt-5">
        <section className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-surface-2 text-2xl font-bold text-card-foreground shadow-card-edge">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                fullName.charAt(0) || "U"
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-md"
              aria-label="Cambiar foto de perfil"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>

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
            className="h-11 rounded-xl text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            autoComplete="name"
          />

          <TextField
            label="Correo electrónico"
            type="email"
            className="h-11 rounded-xl text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
          />

          <TextField
            label="Teléfono"
            type="tel"
            className="h-11 rounded-xl text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Opcional"
            autoComplete="tel"
          />

          <TextField
            label="Usuario"
            className="h-11 rounded-xl text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="nombreusuario"
            autoComplete="username"
          />

          <TextField
            label="Nombre del negocio"
            className="h-11 rounded-xl text-sm"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Nombre de tu tienda"
          />
        </section>
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-20 mx-auto max-w-mobile px-4 safe-bottom">
        <Button
          variant="default"
          fullWidth
          className="rounded-full py-3 text-sm font-bold"
          disabled={!valid}
          onClick={handleSave}
        >
          Guardar
        </Button>
      </div>
    </>
  );
}
