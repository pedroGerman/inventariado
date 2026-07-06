"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { fetchMyBusiness } from "@/lib/business/resolve";
import {
  isMockMode,
  MOCK_ONBOARDING_COOKIE,
  MOCK_SESSION_COOKIE,
} from "@/lib/config";
import { isPasswordValid } from "@/lib/auth/password";
import { ensureProfileForUser } from "@/lib/profile/actions";

async function redirectAfterAuth() {
  const supabase = await createClient();
  const business = await fetchMyBusiness(supabase);
  redirect(business ? "/" : "/onboarding");
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (isMockMode()) {
    const cookieStore = await cookies();
    cookieStore.set(MOCK_SESSION_COOKIE, "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.delete(MOCK_ONBOARDING_COOKIE);
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  await redirectAfterAuth();
}

export async function signup(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  if (!email) {
    return { error: "El correo es obligatorio." };
  }

  if (!isPasswordValid(password)) {
    return { error: "La contraseña no cumple los requisitos." };
  }

  if (isMockMode()) {
    const cookieStore = await cookies();
    cookieStore.set(MOCK_SESSION_COOKIE, "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.delete(MOCK_ONBOARDING_COOKIE);
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await ensureProfileForUser(data.user.id, name, email);
  }

  if (data.session) {
    redirect("/onboarding");
  }

  return {
    success:
      "Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.",
  };
}

export async function changePassword(formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (isMockMode()) {
    return { error: "Cambiar contraseña no está disponible en modo demo." };
  }

  if (!currentPassword) {
    return { error: "Ingresa tu contraseña actual." };
  }

  if (!isPasswordValid(newPassword)) {
    return { error: "La nueva contraseña no cumple los requisitos." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Las contraseñas nuevas no coinciden." };
  }

  if (currentPassword === newPassword) {
    return { error: "La nueva contraseña debe ser distinta a la actual." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Debes iniciar sesión para cambiar la contraseña." };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return { error: "La contraseña actual es incorrecta." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }

  return { success: "Tu contraseña se actualizó correctamente." };
}

export async function logout() {
  if (isMockMode()) {
    const cookieStore = await cookies();
    cookieStore.delete(MOCK_SESSION_COOKIE);
    cookieStore.delete(MOCK_ONBOARDING_COOKIE);
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
