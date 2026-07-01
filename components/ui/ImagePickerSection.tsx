"use client";

import { useRef } from "react";
import { ChevronRight, ImagePlus, Loader2, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import {
  clearPlatformImage,
  IMAGE_ACCEPT,
  uploadPlatformImage,
  type ImageUploadKind,
} from "@/lib/storage";
import { cn } from "@/lib/utils/cn";

interface ImagePickerSectionProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  uploadKind: ImageUploadKind;
  entityId: string;
  emptyTitle?: string;
  emptyDescription?: string;
  filledTitle?: string;
  filledDescription?: string;
  ariaLabel?: string;
  className?: string;
  uploading?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
  error?: string | null;
  onError?: (message: string | null) => void;
  /** When true, only shows a local preview until the parent uploads on save. */
  deferUpload?: boolean;
  pendingFile?: File | null;
  onPendingFileChange?: (file: File | null) => void;
}

function isLocalPreviewUrl(url: string): boolean {
  return url.startsWith("blob:") || url.startsWith("data:");
}

function ImagePickerSection({
  imageUrl,
  onChange,
  uploadKind,
  entityId,
  emptyTitle = "Agregar imagen",
  emptyDescription = "Foto o ícono",
  filledTitle = "Cambiar imagen",
  filledDescription = "Toca para reemplazar la imagen",
  ariaLabel,
  className,
  uploading = false,
  onUploadingChange,
  error,
  onError,
  deferUpload = false,
  pendingFile,
  onPendingFileChange,
}: ImagePickerSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function revokeLocalPreview(url: string | null) {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    onError?.(null);

    if (deferUpload) {
      revokeLocalPreview(imageUrl);
      onPendingFileChange?.(file);
      onChange(URL.createObjectURL(file));
      return;
    }

    onUploadingChange?.(true);

    try {
      const { url } = await uploadPlatformImage({
        kind: uploadKind,
        entityId,
        file,
        previousUrl: imageUrl,
      });
      onChange(url);
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : "No se pudo subir la imagen.",
      );
    } finally {
      onUploadingChange?.(false);
    }
  }

  async function handleRemove() {
    onError?.(null);

    if (deferUpload) {
      revokeLocalPreview(imageUrl);
      onPendingFileChange?.(null);
      onChange(null);
      return;
    }

    onUploadingChange?.(true);
    try {
      if (imageUrl && !isLocalPreviewUrl(imageUrl)) {
        await clearPlatformImage(imageUrl);
      }
      onChange(null);
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : "No se pudo quitar la imagen.",
      );
    } finally {
      onUploadingChange?.(false);
    }
  }

  const title = imageUrl ? filledTitle : emptyTitle;
  const description = imageUrl ? filledDescription : emptyDescription;
  const showPendingHint = deferUpload && pendingFile && !uploading;

  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-sm font-semibold text-card-foreground">Imagen</h2>
      <div className="relative">
        <button
          type="button"
          className="w-full text-left"
          aria-label={ariaLabel ?? title}
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Card className="gap-0 !py-5 transition-[box-shadow] hover:shadow-ff-surface-4">
            <CardContent className="flex items-center gap-3 !px-5">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 shadow-segmented-track">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-card-foreground">
                  {uploading ? "Subiendo…" : title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {showPendingHint
                    ? "Se subirá al guardar"
                    : description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </button>

        {imageUrl && !uploading ? (
          <button
            type="button"
            aria-label="Quitar imagen"
            onClick={() => void handleRemove()}
            className="absolute right-3 top-3 rounded-full bg-surface-0/90 p-1 text-muted-foreground shadow-card-edge hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          disabled={uploading}
          onChange={(event) => void handleFileChange(event)}
        />
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </section>
  );
}

export { ImagePickerSection };
