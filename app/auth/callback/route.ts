import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchMyBusiness } from "@/lib/business/resolve";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const business = await fetchMyBusiness(supabase);
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const destination = business ? safeNext : "/onboarding";

  return NextResponse.redirect(`${origin}${destination}`);
}
