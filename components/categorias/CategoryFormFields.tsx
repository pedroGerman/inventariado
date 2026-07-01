"use client";

import { Check } from "lucide-react";
import { TextField } from "@/components/ui/Input";
import { ImagePickerSection } from "@/components/ui/ImagePickerSection";
import { Toggle } from "@/components/ui/Toggle";
import type { Category } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

const SHOW_IN_OPTIONS = [
  { value: "ventas" as const, label: "Ventas" },
  { value: "compras" as const, label: "Gastos/Compras" },
];

interface CategoryFormFieldsProps {
  entityId: string;
  name: string;
  onNameChange: (value: string) => void;
  imageUrl: string | null;
  onImageUrlChange: (url: string | null) => void;
  pendingImageFile?: File | null;
  onPendingImageFileChange?: (file: File | null) => void;
  deferImageUpload?: boolean;
  active: boolean;
  onActiveChange: (value: boolean) => void;
  showIn: Category["show_in"];
  onShowInChange: (value: Category["show_in"]) => void;
  imageUploading?: boolean;
  onImageUploadingChange?: (uploading: boolean) => void;
  imageError?: string | null;
  onImageError?: (message: string | null) => void;
}

function CategoryFormFields({
  entityId,
  name,
  onNameChange,
  imageUrl,
  onImageUrlChange,
  pendingImageFile,
  onPendingImageFileChange,
  deferImageUpload = false,
  active,
  onActiveChange,
  showIn,
  onShowInChange,
  imageUploading = false,
  onImageUploadingChange,
  imageError,
  onImageError,
}: CategoryFormFieldsProps) {
  function toggleShowIn(value: "ventas" | "compras") {
    onShowInChange(
      showIn.includes(value)
        ? showIn.filter((v) => v !== value)
        : [...showIn, value],
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <ImagePickerSection
        imageUrl={imageUrl}
        onChange={onImageUrlChange}
        uploadKind="category"
        entityId={entityId}
        deferUpload={deferImageUpload}
        pendingFile={pendingImageFile}
        onPendingFileChange={onPendingImageFileChange}
        uploading={imageUploading}
        onUploadingChange={onImageUploadingChange}
        error={imageError}
        onError={onImageError}
        emptyDescription="Foto o ícono para esta categoría"
        filledDescription="Toca para reemplazar la imagen de la categoría"
        ariaLabel="Imagen de la categoría"
      />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-card-foreground">Nombre</h2>
        <TextField
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej. Bebidas"
          className="text-sm"
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-card-foreground">Estado</h2>
        <Toggle label="Activo" checked={active} onChange={onActiveChange} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-card-foreground">Mostrar en</h2>
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label="Mostrar categoría en"
        >
          {SHOW_IN_OPTIONS.map((option) => {
            const isSelected = showIn.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleShowIn(option.value)}
                className={cn(
                  "relative flex min-h-[52px] items-center justify-center rounded-xl border-0 px-3 py-3 text-sm transition-[color,background-color,box-shadow,transform]",
                  isSelected
                    ? "bg-green-50 font-semibold text-[var(--button-success)] shadow-button-tone-green-rest dark:bg-green-950/35"
                    : "bg-surface-2 font-medium text-muted-foreground shadow-card-edge hover:bg-surface-3 hover:text-secondary-foreground hover:shadow-overview-metric active:scale-[0.99]",
                )}
              >
                {option.label}
                {isSelected ? (
                  <Check
                    className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--button-success)]"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export { CategoryFormFields, SHOW_IN_OPTIONS };
