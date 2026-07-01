import { isMockMode } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { getUploadContext } from "@/lib/storage/context";
import { STORAGE_BUCKET } from "@/lib/storage/constants";
import { deletePlatformImage } from "@/lib/storage/deleteImage";
import {
  buildStoragePath,
  extensionFromMime,
} from "@/lib/storage/paths";
import type { UploadImageOptions, UploadImageResult } from "@/lib/storage/types";
import { validateImageFile } from "@/lib/storage/validateImageFile";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("No se pudo leer la imagen."));
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function resolveEntityId(kind: UploadImageOptions["kind"], entityId: string, userId: string) {
  return kind === "avatar" ? userId : entityId;
}

export async function uploadPlatformImage(
  options: UploadImageOptions,
): Promise<UploadImageResult> {
  const validationError = validateImageFile(options.file);
  if (validationError) throw new Error(validationError);

  const context = await getUploadContext();
  const targetId = resolveEntityId(options.kind, options.entityId, context.userId);

  if (isMockMode()) {
    const url = await readFileAsDataUrl(options.file);
    return { url };
  }

  const ext = extensionFromMime(options.file.type);
  const path = buildStoragePath(
    options.kind,
    context.businessId,
    targetId,
    ext,
  );

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, options.file, {
      upsert: true,
      contentType: options.file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  if (options.previousUrl && options.previousUrl !== publicUrl) {
    await deletePlatformImage(options.previousUrl);
  }

  return { url: publicUrl };
}

export async function clearPlatformImage(
  url: string | null | undefined,
): Promise<void> {
  await deletePlatformImage(url);
}

export { IMAGE_ACCEPT, MAX_IMAGE_BYTES } from "@/lib/storage/constants";
export type { ImageUploadKind, UploadContext } from "@/lib/storage/types";
