"use client";

import { useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import {
  clearPlatformImage,
  IMAGE_ACCEPT,
  uploadPlatformImage,
} from "@/lib/storage";
import { cn } from "@/lib/utils/cn";

interface AvatarImagePickerProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  userId: string;
  fallbackLabel: string;
  className?: string;
  disabled?: boolean;
  uploading?: boolean;
  error?: string | null;
  /** When true, only shows a local preview until the parent uploads on save. */
  deferUpload?: boolean;
  pendingFile?: File | null;
  onPendingFileChange?: (file: File | null) => void;
}

function revokeLocalPreview(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function AvatarImagePicker({
  imageUrl,
  onChange,
  userId,
  fallbackLabel,
  className,
  disabled = false,
  uploading = false,
  error,
  deferUpload = false,
  pendingFile,
  onPendingFileChange,
}: AvatarImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const showPendingHint = deferUpload && pendingFile && !uploading;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (deferUpload) {
      revokeLocalPreview(imageUrl);
      onPendingFileChange?.(file);
      onChange(URL.createObjectURL(file));
      return;
    }

    try {
      const { url } = await uploadPlatformImage({
        kind: "avatar",
        entityId: userId,
        file,
        previousUrl: imageUrl,
      });
      onChange(url);
    } catch (err) {
      console.error("[AvatarImagePicker]", err);
    }
  }

  async function handleRemove() {
    if (deferUpload) {
      revokeLocalPreview(imageUrl);
      onPendingFileChange?.(null);
      onChange(null);
      return;
    }

    try {
      if (imageUrl && !imageUrl.startsWith("blob:") && !imageUrl.startsWith("data:")) {
        await clearPlatformImage(imageUrl);
      }
      onChange(null);
    } catch (err) {
      console.error("[AvatarImagePicker]", err);
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-surface-2 text-2xl font-bold text-card-foreground shadow-card-edge">
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          ) : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            fallbackLabel.charAt(0) || "U"
          )}
        </div>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-md disabled:opacity-60"
          aria-label="Cambiar foto de perfil"
        >
          <Camera className="size-4" />
        </button>
        {imageUrl && !uploading ? (
          <button
            type="button"
            aria-label="Quitar foto de perfil"
            disabled={disabled}
            onClick={() => void handleRemove()}
            className="absolute -right-1 top-0 flex size-7 items-center justify-center rounded-full bg-surface-0 text-muted-foreground shadow-card-edge hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(event) => void handleFileChange(event)}
        />
      </div>
      {showPendingHint ? (
        <p className="text-center text-xs text-muted-foreground">
          Se subirá al guardar
        </p>
      ) : null}
      {error ? <p className="text-center text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export async function removeAvatarImage(url: string | null) {
  await clearPlatformImage(url);
}
