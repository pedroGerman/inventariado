"use client";

import { useEffect, useState } from "react";
import { AppDrawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { CategoryFormFields } from "@/components/categorias/CategoryFormFields";
import {
  getActiveBusinessId,
  saveCategory,
  newEntityId,
} from "@/lib/mock/db";
import {
  uploadPlatformImage,
} from "@/lib/storage";
import type { Category } from "@/lib/types/database";

interface QuickCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: (category: Category) => void;
}

function QuickCategoryDrawer({ open, onClose, onCreated }: QuickCategoryDrawerProps) {
  const [entityId, setEntityId] = useState(() => newEntityId());
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [active, setActive] = useState(true);
  const [showIn, setShowIn] = useState<Category["show_in"]>(["ventas"]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setEntityId(newEntityId());
    setName("");
    setImageUrl(null);
    setPendingImageFile(null);
    setActive(true);
    setShowIn(["ventas"]);
    setImageError(null);
    setImageUploading(false);
    setSaving(false);
  }, [open]);

  async function handleCreate() {
    if (!name.trim() || showIn.length === 0 || saving) return;

    setSaving(true);
    setImageError(null);

    try {
      let finalImageUrl = imageUrl;

      if (pendingImageFile) {
        setImageUploading(true);
        const { url } = await uploadPlatformImage({
          kind: "category",
          entityId,
          file: pendingImageFile,
        });
        finalImageUrl = url;
        if (imageUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(imageUrl);
        }
      }

      const category: Category = {
        id: entityId,
        business_id: getActiveBusinessId(),
        name: name.trim(),
        image_url: finalImageUrl,
        active,
        show_in: showIn,
        created_at: new Date().toISOString(),
      };

      await saveCategory(category);
      onCreated(category);
      onClose();
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "No se pudo crear la categoría.",
      );
    } finally {
      setImageUploading(false);
      setSaving(false);
    }
  }

  function handleClose() {
    if (imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    if (pendingImageFile) {
      setPendingImageFile(null);
    }
    onClose();
  }

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      title="Nueva categoría"
      snapPoint={0.85}
    >
      <div className="flex flex-col gap-6 pb-4">
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

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={saving}
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="success"
            fullWidth
            disabled={!name.trim() || showIn.length === 0 || saving || imageUploading}
            onClick={() => void handleCreate()}
          >
            {saving ? "Creando…" : "Crear categoría"}
          </Button>
        </div>
      </div>
    </AppDrawer>
  );
}

export { QuickCategoryDrawer };
