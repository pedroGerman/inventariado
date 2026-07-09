import "server-only";

import { isMockMode } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export function getFeedbackAdminEmailsFromEnv(): string[] {
  const raw = process.env.FEEDBACK_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isEmailInEnvAllowlist(email: string): boolean {
  return getFeedbackAdminEmailsFromEnv().includes(email.trim().toLowerCase());
}

/** @deprecated Usar canManageFeedback(); la autorización real está en Supabase RLS. */
export function isFeedbackAdminEmail(email: string): boolean {
  return isEmailInEnvAllowlist(email);
}

export async function canManageFeedback(): Promise<boolean> {
  if (isMockMode()) return true;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return false;

  const { data: isAdmin } = await supabase.rpc("is_feedback_admin_user");
  return isAdmin === true;
}
