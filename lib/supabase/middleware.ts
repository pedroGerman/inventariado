import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { fetchMyBusiness } from "@/lib/business/resolve";
import {
  isMockMode,
  MOCK_ONBOARDING_COOKIE,
  MOCK_SESSION_COOKIE,
} from "@/lib/config";

function isPublicAuthRoute(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/signup");
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isOnboarding = pathname.startsWith("/onboarding");

  if (isMockMode()) {
    const hasSession =
      request.cookies.get(MOCK_SESSION_COOKIE)?.value === "1";
    const onboardingDone =
      request.cookies.get(MOCK_ONBOARDING_COOKIE)?.value === "1";

    if (!hasSession && !isPublicAuthRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (hasSession && isPublicAuthRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = onboardingDone ? "/" : "/onboarding";
      return NextResponse.redirect(url);
    }

    if (hasSession && !onboardingDone && !isPublicAuthRoute(pathname) && !isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    if (hasSession && onboardingDone && isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const business = user ? await fetchMyBusiness(supabase) : null;

  if (user && isPublicAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = business ? "/" : "/onboarding";
    return NextResponse.redirect(url);
  }

  if (user && !isPublicAuthRoute(pathname) && !isOnboarding && !business) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  if (user && isOnboarding && business) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
