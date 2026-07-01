import { STORAGE_BUCKET } from "@/lib/storage/constants";
import type { ImageUploadKind } from "@/lib/storage/types";

export function extensionFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export function buildStoragePath(
  kind: ImageUploadKind,
  businessId: string,
  entityId: string,
  ext: string,
): string {
  switch (kind) {
    case "category":
      return `${businessId}/categories/${entityId}.${ext}`;
    case "product":
      return `${businessId}/products/${entityId}.${ext}`;
    case "avatar":
      return `${businessId}/avatars/${entityId}.${ext}`;
    case "business-logo":
      return `${businessId}/logo.${ext}`;
  }
}

export function extractStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

export function isDataUrl(url: string): boolean {
  return url.startsWith("data:");
}

export function isPlatformStorageUrl(url: string): boolean {
  return extractStoragePath(url) !== null;
}
