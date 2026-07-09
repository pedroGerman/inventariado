"use server";

import { isMockMode } from "@/lib/config";
import { canManageFeedback } from "@/lib/feedback/admin";
import {
  getMockFeedback,
  listMockFeedback,
  submitMockFeedback,
  updateMockFeedbackStatus,
} from "@/lib/feedback/mock";
import { createClient } from "@/lib/supabase/server";
import type { FeedbackStatus, UserFeedback } from "@/lib/types/database";
import { fetchMyBusiness } from "@/lib/business/resolve";

export async function getFeedbackAdminStatus(): Promise<boolean> {
  return canManageFeedback();
}

export async function submitFeedback(input: {
  senderName?: string;
  senderEmail?: string;
  message: string;
}): Promise<{ error?: string }> {
  const message = input.message.trim();
  if (!message) {
    return { error: "El mensaje es obligatorio." };
  }

  const senderName = input.senderName?.trim() || null;
  const senderEmail = input.senderEmail?.trim() || null;

  if (isMockMode()) {
    submitMockFeedback({
      userId: "mock-user",
      businessId: null,
      senderName,
      senderEmail,
      message,
    });
    return {};
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  const business = await fetchMyBusiness(supabase);

  const { error } = await supabase.from("user_feedback").insert({
    user_id: user.id,
    business_id: business?.id ?? null,
    sender_name: senderName,
    sender_email: senderEmail,
    message,
  });

  if (error) return { error: error.message };
  return {};
}

export async function listFeedbackForAdmin(): Promise<{
  items?: UserFeedback[];
  error?: string;
}> {
  if (!(await canManageFeedback())) {
    return { error: "No tienes permiso para ver los comentarios." };
  }

  if (isMockMode()) {
    return { items: listMockFeedback() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { items: (data ?? []) as UserFeedback[] };
}

export async function getFeedbackById(
  id: string,
): Promise<{ item?: UserFeedback; error?: string }> {
  if (!(await canManageFeedback())) {
    return { error: "No tienes permiso para ver este comentario." };
  }

  if (isMockMode()) {
    const item = getMockFeedback(id);
    if (!item) return { error: "Comentario no encontrado." };
    return { item };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_feedback")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Comentario no encontrado." };
  return { item: data as UserFeedback };
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): Promise<{ item?: UserFeedback; error?: string }> {
  if (!(await canManageFeedback())) {
    return { error: "No tienes permiso para actualizar este comentario." };
  }

  if (isMockMode()) {
    const item = updateMockFeedbackStatus(id, status);
    if (!item) return { error: "Comentario no encontrado." };
    return { item };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const patch: Partial<UserFeedback> = { status };

  if (status === "read" || status === "resolved") {
    patch.read_at = now;
  }
  if (status === "resolved") {
    patch.resolved_at = now;
  }

  const { data, error } = await supabase
    .from("user_feedback")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Comentario no encontrado." };
  return { item: data as UserFeedback };
}
