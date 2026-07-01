export function isMockMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const MOCK_SESSION_COOKIE = "pos-mock-session";
export const MOCK_ONBOARDING_COOKIE = "pos-onboarding-complete";
