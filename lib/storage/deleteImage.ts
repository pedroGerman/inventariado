import { isMockMode } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/storage/constants";
import {
  extractStoragePath,
  isDataUrl,
  isPlatformStorageUrl,
} from "@/lib/storage/paths";

export async function deletePlatformImage(url: string | null | undefined): Promise<void> {
  if (!url || isDataUrl(url) || !isPlatformStorageUrl(url)) return;

  if (isMockMode()) return;

  const path = extractStoragePath(url);
  if (!path) return;

  const supabase = createClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) {
    console.warn("[storage] No se pudo eliminar la imagen anterior:", error.message);
  }
}
