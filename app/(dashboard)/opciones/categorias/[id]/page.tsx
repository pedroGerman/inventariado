"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { CategoryFormFields } from "@/components/categorias/CategoryFormFields";
import {
  getCategories,
  saveCategory,
  deleteCategory,
  newEntityId,
  getActiveBusinessId,
} from "@/lib/mock/db";
import {
  clearPlatformImage,
  uploadPlatformImage,
} from "@/lib/storage";
import type { Category } from "@/lib/types/database";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";

export default function CategoriaFormPage() {
  useMockDBRefresh();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "nuevo";
  const existing = isNew ? null : getCategories().find((c) => c.id === id);

  const [entityId] = useState(() => existing?.id ?? newEntityId());
  const [name, setName] = useState(existing?.name ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(existing?.image_url ?? null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [active, setActive] = useState(existing?.active ?? true);
  const [showIn, setShowIn] = useState<Category["show_in"]>(
    existing?.show_in ?? ["ventas"],
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setImageUrl(existing.image_url);
      setActive(existing.active);
      setShowIn(existing.show_in);
    }
  }, [existing]);

  async function handleSave() {
    if (!name.trim() || showIn.length === 0 || saving) return;

    setSaving(true);
    setImageError(null);

    try {
      let finalImageUrl = imageUrl;
      const previousRemoteUrl = existing?.image_url ?? null;

      if (pendingImageFile) {
        setImageUploading(true);
        const { url } = await uploadPlatformImage({
          kind: "category",
          entityId,
          file: pendingImageFile,
          previousUrl: previousRemoteUrl,
        });
        finalImageUrl = url;
        if (imageUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(imageUrl);
        }
      } else if (!imageUrl && previousRemoteUrl) {
        await clearPlatformImage(previousRemoteUrl);
        finalImageUrl = null;
      }

      await saveCategory({
        id: entityId,
        business_id: getActiveBusinessId(),
        name: name.trim(),
        image_url: finalImageUrl,
        active,
        show_in: showIn,
        created_at: existing?.created_at ?? new Date().toISOString(),
      });
      router.push("/opciones/categorias");
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "No se pudo guardar la categoría.",
      );
    } finally {
      setImageUploading(false);
      setSaving(false);
    }
  }

  return (
    <>
      <Header
        title={isNew ? "Nueva Categoría" : "Editar Categoría"}
        showBack
        backHref="/opciones/categorias"
      />

      <div className="flex flex-col gap-7 px-4 py-4 pb-28">
        <CategoryFormFields
          entityId={entityId}
          name={name}
          onNameChange={setName}
          imageUrl={imageUrl}
          onImageUrlChange={setImageUrl}
          pendingImageFile={pendingImageFile}
          onPendingImageFileChange={setPendingImageFile}
          deferImageUpload
          active={active}
          onActiveChange={setActive}
          showIn={showIn}
          onShowInChange={setShowIn}
          imageUploading={imageUploading}
          onImageUploadingChange={setImageUploading}
          imageError={imageError}
          onImageError={setImageError}
        />

        {!isNew && existing && (
          <Button
            type="button"
            variant="destructive"
            fullWidth
            onClick={() => {
              void deleteCategory(existing.id).then(() =>
                router.push("/opciones/categorias"),
              );
            }}
            iconLeft={<Trash2 className="h-4 w-4" />}
          >
            Eliminar categoría
          </Button>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-10 mx-auto max-w-mobile border-t border-border/50 bg-surface-0 px-4 py-4 safe-bottom">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={saving}
            onClick={() => router.push("/opciones/categorias")}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="success"
            fullWidth
            disabled={!name.trim() || showIn.length === 0 || saving || imageUploading}
            onClick={() => void handleSave()}
          >
            {saving ? "Guardando…" : isNew ? "Crear categoría" : "Guardar"}
          </Button>
        </div>
      </div>
    </>
  );
}
