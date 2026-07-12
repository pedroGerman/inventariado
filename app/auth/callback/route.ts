import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchMyBusiness } from "@/lib/business/resolve";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/";

  // Password recovery must land on the new-password form even without a business.
  if (
    type === "recovery" ||
    safeNext.startsWith("/recuperar-contrasena")
  ) {
    return NextResponse.redirect(`${origin}/recuperar-contrasena`);
  }

  const business = await fetchMyBusiness(supabase);
  const destination = business ? safeNext : "/onboarding";

  return NextResponse.redirect(`${origin}${destination}`);
}
