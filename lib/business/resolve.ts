import type { SupabaseClient } from "@supabase/supabase-js";
import type { Business } from "@/lib/types/database";

export function isBusinessRecord(value: unknown): value is Business {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as Business).id === "string" &&
    (value as Business).id.length > 0 &&
    "name" in value &&
    typeof (value as Business).name === "string"
  );
}

export async function fetchMyBusiness(
  supabase: SupabaseClient,
): Promise<Business | null> {
  const { data, error } = await supabase.rpc("get_my_business");

  if (error) {
    console.error("[fetchMyBusiness]", error.message);
    return null;
  }

  return isBusinessRecord(data) ? data : null;
}
