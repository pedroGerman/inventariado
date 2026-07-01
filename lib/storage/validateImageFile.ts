import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
} from "@/lib/storage/constants";

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return "Formato no permitido. Usa JPG, PNG, WebP o GIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "La imagen supera el límite de 5 MB.";
  }
  return null;
}
