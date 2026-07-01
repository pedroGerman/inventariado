"use server";

import { isMockMode } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { AccountProfile } from "@/lib/types/database";
import { authMetadataName, profileUsernameFromName } from "@/lib/profile/username";

function emailPrefix(email: string | undefined): string {
  return email?.split("@")[0]?.trim() ?? "";
}

function profileFromAuthUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): AccountProfile {
  const metaName = authMetadataName(user.user_metadata);
  const email = user.email ?? "";
  const prefix = emailPrefix(email);

  return {
    user_id: user.id,
    full_name: metaName || prefix || "Usuario",
    email,
    username: profileUsernameFromName(metaName || prefix || "usuario", user.id),
    phone: null,
    avatar_url: null,
  };
}

export async function getProfile(): Promise<AccountProfile | null> {
  if (isMockMode()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const metaName = authMetadataName(user.user_metadata);
  const email = user.email ?? "";
  const prefix = emailPrefix(email);

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, username, phone, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    const fallback = profileFromAuthUser(user);

    if (metaName) {
      await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          full_name: metaName,
          email: fallback.email,
          username: fallback.username,
        },
        { onConflict: "user_id" },
      );
      return { ...fallback, full_name: metaName };
    }

    return fallback;
  }

  const storedName = data.full_name?.trim() ?? "";
  const looksLikeEmailPrefix =
    !!prefix && (storedName === prefix || storedName === data.username);

  if (metaName && (!storedName || looksLikeEmailPrefix)) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: metaName })
      .eq("user_id", user.id);

    if (!updateError) {
      return { ...(data as AccountProfile), full_name: metaName };
    }
  }

  return data as AccountProfile;
}

export async function ensureProfileForUser(
  userId: string,
  fullName: string,
  email: string,
): Promise<void> {
  if (isMockMode()) return;

  const supabase = await createClient();
  const trimmedName = fullName.trim();
  if (!trimmedName) return;

  await supabase.from("profiles").upsert(
    {
      user_id: userId,
      full_name: trimmedName,
      email: email.trim(),
      username: profileUsernameFromName(trimmedName, userId),
    },
    { onConflict: "user_id" },
  );
}

export async function saveProfile(
  profile: Pick<
    AccountProfile,
    "full_name" | "email" | "username" | "phone" | "avatar_url"
  >,
): Promise<{ error?: string }> {
  if (isMockMode()) return {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      full_name: profile.full_name.trim(),
      email: profile.email.trim(),
      username: profile.username.trim(),
      phone: profile.phone,
      avatar_url: profile.avatar_url,
    },
    { onConflict: "user_id" },
  );

  if (error) return { error: error.message };
  return {};
}
