"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { hydrateDataStore } from "@/lib/data/store";
import { isMockMode } from "@/lib/config";
import { getProfile, saveProfile } from "@/lib/profile/actions";
import { useEmployeeStore } from "@/lib/store/employee";
import { clearPlatformImage, uploadPlatformImage } from "@/lib/storage";

function slugifyUsername(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

type ProfileSnapshot = {
  fullName: string;
  email: string;
  username: string;
  phone: string;
  businessName: string;
  avatarUrl: string | null;
  userId: string;
};

export default function EditarCuentaPage() {
  const router = useRouter();
  const currentEmployee = useEmployeeStore((s) => s.current);
  const setCurrentEmployee = useEmployeeStore((s) => s.setCurrent);
  const initialRef = useRef<ProfileSnapshot | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      try {
        await hydrateDataStore();

        const remoteProfile = isMockMode() ? null : await getProfile();
        const cachedProfile = getAccountProfile();
        const profile = remoteProfile ?? cachedProfile;
        const business = getBusiness();

        if (cancelled) return;

        const snapshot: ProfileSnapshot = {
          fullName: profile.full_name,
          email: profile.email,
          username: profile.username,
          phone: profile.phone ?? "",
          businessName: business.name,
          avatarUrl: profile.avatar_url,
          userId: profile.user_id,
        };

        initialRef.current = snapshot;
        setFullName(snapshot.fullName);
        setEmail(snapshot.email);
        setUsername(snapshot.username);
        setPhone(snapshot.phone);
        setBusinessName(snapshot.businessName);
        setAvatarUrl(snapshot.avatarUrl);
        setUserId(snapshot.userId);
        setPendingImageFile(null);
        setIsDirty(false);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el perfil.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (avatarUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  const valid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    businessName.trim().length > 0;

  const canSave = valid && isDirty && !saving && !imageUploading;

  function handleAvatarChange(url: string | null) {
    setAvatarUrl(url);
    setIsDirty(true);
  }

  function handlePendingImageChange(file: File | null) {
    setPendingImageFile(file);
    setIsDirty(true);
  }

  async function handleSave() {
    if (!canSave || !initialRef.current) return;

    setSaving(true);
    setError(null);
    setImageError(null);

    const trimmedName = fullName.trim();
    const trimmedUsername =
      username.trim() || slugifyUsername(trimmedName) || "usuario";
    const initial = initialRef.current;

    try {
      let finalAvatarUrl = avatarUrl;
      const previousRemoteUrl = initial.avatarUrl;

      if (pendingImageFile) {
        setImageUploading(true);
        const { url } = await uploadPlatformImage({
          kind: "avatar",
          entityId: userId || initial.userId,
          file: pendingImageFile,
          previousUrl: previousRemoteUrl,
        });
        finalAvatarUrl = url;
        if (avatarUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(avatarUrl);
        }
      } else if (!avatarUrl && previousRemoteUrl) {
        await clearPlatformImage(previousRemoteUrl);
        finalAvatarUrl = null;
      }

      const profilePayload = {
        full_name: trimmedName,
        email: email.trim(),
        username: trimmedUsername,
        phone: phone.trim() || null,
        avatar_url: finalAvatarUrl,
      };

      const cachedProfile = getAccountProfile();

      if (isMockMode()) {
        saveAccountProfile({
          ...cachedProfile,
          user_id: userId || initial.userId,
          ...profilePayload,
        });
      } else {
        const result = await saveProfile(profilePayload);
        if (result.error) {
          setError(result.error);
          return;
        }

        saveAccountProfile({
          ...cachedProfile,
          user_id: userId || initial.userId,
          ...profilePayload,
        });
      }

      const initialBusiness = getBusiness();
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
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "No se pudo guardar la foto.",
      );
    } finally {
      setImageUploading(false);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Editar perfil" showBack backHref="/opciones" />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Cargando perfil…
        </p>
      </>
    );
  }

  return (
    <>
      <Header title="Editar perfil" showBack backHref="/opciones" />

      <div className="flex flex-col gap-6 px-4 pb-5 pt-5">
        <section className="flex flex-col items-center gap-3 text-center">
          <AvatarImagePicker
            imageUrl={avatarUrl}
            onChange={handleAvatarChange}
            userId={userId}
            fallbackLabel={fullName.trim() || "U"}
            deferUpload
            pendingFile={pendingImageFile}
            onPendingFileChange={handlePendingImageChange}
            uploading={imageUploading}
            error={imageError}
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
            onChange={(e) => {
              setFullName(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Tu nombre"
            autoComplete="name"
          />

          <TextField
            label="Correo electrónico"
            type="email"
            className="h-11 rounded-lg text-sm"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setIsDirty(true);
            }}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
          />

          <TextField
            label="Teléfono"
            type="tel"
            className="h-11 rounded-lg text-sm"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Opcional"
            autoComplete="tel"
          />

          <TextField
            label="Usuario"
            className="h-11 rounded-lg text-sm"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setIsDirty(true);
            }}
            placeholder="nombreusuario"
            autoComplete="username"
          />

          <TextField
            label="Nombre del negocio"
            className="h-11 rounded-lg text-sm"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Nombre de tu tienda"
          />
        </section>

        {!isMockMode() && (
          <Button
            asChild
            variant="secondary"
            fullWidth
            className="rounded-full py-3 text-sm font-bold"
          >
            <Link href="/opciones/cuenta/cambiar-contrasena">
              Cambiar contraseña
            </Link>
          </Button>
        )}
      </div>

      <div className="mx-auto max-w-mobile px-4 pb-4">
        {error && (
          <p className="mb-3 text-center text-sm text-destructive">{error}</p>
        )}
        <Button
          type="button"
          variant="success"
          fullWidth
          className="rounded-full py-3 text-sm font-bold"
          disabled={!canSave}
          loading={saving || imageUploading}
          onClick={() => void handleSave()}
        >
          {saving || imageUploading ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </>
  );
}
