import { isMockMode } from "@/lib/config";
import { getBusiness, getAccountProfile } from "@/lib/data/store";
import { MOCK_BUSINESS_ID, MOCK_USER_ID } from "@/lib/mock/seed";
import { createClient } from "@/lib/supabase/client";
import type { UploadContext } from "@/lib/storage/types";

export async function getUploadContext(): Promise<UploadContext> {
  if (isMockMode()) {
    const business = getBusiness();
    const account = getAccountProfile();
    return {
      businessId: business.id || MOCK_BUSINESS_ID,
      userId: account.user_id || MOCK_USER_ID,
    };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Debes iniciar sesión para subir imágenes.");
  }

  const { data: business, error: businessError } = await supabase.rpc(
    "get_my_business",
  );

  if (businessError || !business?.id) {
    throw new Error("No se encontró el negocio asociado a tu cuenta.");
  }

  return {
    businessId: business.id as string,
    userId: user.id,
  };
}
