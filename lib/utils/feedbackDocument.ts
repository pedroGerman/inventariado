import type { UserFeedback } from "@/lib/types/database";
import { getFeedbackStatusLabel } from "@/lib/utils/feedbackStatusFilter";

export interface FeedbackDocument {
  id: string;
  title: string;
  businessName: string;
  senderName: string;
  senderEmail: string | null;
  message: string;
  statusLabel: string;
  date: string;
  createdAt: string;
}

export function feedbackPdfFileName(id: string): string {
  const safe = id.replace(/[^\w-]+/g, "-").slice(0, 24);
  return `comentario-${safe}.pdf`;
}

export function feedbackToDocument(
  item: UserFeedback,
  businessName: string,
): FeedbackDocument {
  return {
    id: item.id,
    title: "COMENTARIO DE USUARIO",
    businessName,
    senderName:
      item.sender_name?.trim() ||
      item.sender_email?.trim() ||
      "Usuario anónimo",
    senderEmail: item.sender_email?.trim() || null,
    message: item.message.trim(),
    statusLabel: getFeedbackStatusLabel(item.status),
    date: item.created_at.split("T")[0],
    createdAt: item.created_at,
  };
}
