import type { FeedbackStatus, UserFeedback } from "@/lib/types/database";

const STORAGE_KEY = "pos-user-feedback";

function readAll(): UserFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserFeedback[];
  } catch {
    return [];
  }
}

function writeAll(items: UserFeedback[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listMockFeedback(): UserFeedback[] {
  return readAll().sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getMockFeedback(id: string): UserFeedback | null {
  return readAll().find((item) => item.id === id) ?? null;
}

export function submitMockFeedback(input: {
  userId: string;
  businessId: string | null;
  senderName: string | null;
  senderEmail: string | null;
  message: string;
}): UserFeedback {
  const item: UserFeedback = {
    id: crypto.randomUUID(),
    user_id: input.userId,
    business_id: input.businessId,
    sender_name: input.senderName,
    sender_email: input.senderEmail,
    message: input.message,
    status: "pending",
    created_at: new Date().toISOString(),
    read_at: null,
    resolved_at: null,
  };

  const next = [item, ...readAll()];
  writeAll(next);
  return item;
}

export function updateMockFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): UserFeedback | null {
  const items = readAll();
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const now = new Date().toISOString();
  const current = items[index];
  const updated: UserFeedback = {
    ...current,
    status,
    read_at:
      status === "read" || status === "resolved"
        ? current.read_at ?? now
        : current.read_at,
    resolved_at: status === "resolved" ? now : current.resolved_at,
  };

  items[index] = updated;
  writeAll(items);
  return updated;
}
