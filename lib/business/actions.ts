"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { fetchMyBusiness } from "@/lib/business/resolve";
import {
  DEFAULT_CURRENCY,
  isSupportedCurrency,
} from "@/lib/constants/currencies";
import {
  isMockMode,
  MOCK_ONBOARDING_COOKIE,
} from "@/lib/config";
import type { Employee } from "@/lib/types/database";

export async function createBusiness(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const currencyRaw = ((formData.get("currency") as string) ?? "")
    .trim()
    .toUpperCase();
  const currency = isSupportedCurrency(currencyRaw)
    ? currencyRaw
    : DEFAULT_CURRENCY;

  if (!name) {
    return { error: "El nombre de la tienda es obligatorio." };
  }

  if (isMockMode()) {
    const cookieStore = await cookies();
    cookieStore.set(MOCK_ONBOARDING_COOKIE, "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  const existing = await fetchMyBusiness(supabase);

  if (existing) {
    redirect("/");
  }

  const { error } = await supabase.rpc("create_business", {
    p_name: name,
    p_logo_url: null,
    p_currency: currency,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function getMyBusiness() {
  if (isMockMode()) return null;

  const supabase = await createClient();
  return fetchMyBusiness(supabase);
}

export async function getMyEmployee(): Promise<Employee | null> {
  if (isMockMode()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const business = await fetchMyBusiness(supabase);
  if (!business) return null;

  const { data, error } = await supabase
    .from("employees")
    .select("id, business_id, user_id, name, role, active, created_at")
    .eq("business_id", business.id)
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    console.error("[getMyEmployee]", error?.message);
    return null;
  }

  return data as Employee;
}
