"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
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
}

export function AvatarImagePicker({
  imageUrl,
  onChange,
  userId,
  fallbackLabel,
  className,
  disabled = false,
}: AvatarImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadPlatformImage({
        kind: "avatar",
        entityId: userId,
        file,
        previousUrl: imageUrl,
      });
      onChange(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo subir la imagen.",
      );
    } finally {
      setUploading(false);
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
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(event) => void handleFileChange(event)}
        />
      </div>
      {error ? <p className="text-center text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export async function removeAvatarImage(url: string | null) {
  await clearPlatformImage(url);
}
