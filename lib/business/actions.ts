"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/config";

export async function createBusiness(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();

  if (!name) {
    return { error: "El nombre de la tienda es obligatorio." };
  }

  if (isMockMode()) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  const { data: existing } = await supabase.rpc("get_my_business");

  if (existing) {
    redirect("/");
  }

  const { error } = await supabase.rpc("create_business", {
    p_name: name,
    p_logo_url: null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function getMyBusiness() {
  if (isMockMode()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_business");

  if (error || !data) return null;
  return data;
}
