/** Username estable para profiles (misma lógica que el trigger SQL). */
export function profileUsernameFromName(name: string, userId: string): string {
  const username = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (username) return username;
  return `user${userId.replace(/-/g, "").slice(0, 8)}`;
}

export function authMetadataName(
  metadata: Record<string, unknown> | undefined,
): string {
  const name = metadata?.name;
  return typeof name === "string" ? name.trim() : "";
}
