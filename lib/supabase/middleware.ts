import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isMockMode,
  MOCK_ONBOARDING_COOKIE,
  MOCK_SESSION_COOKIE,
} from "@/lib/config";

/** Stay well under Vercel's 25s middleware limit so a hung Supabase call cannot 504 the app. */
const SUPABASE_FETCH_TIMEOUT_MS = 8_000;

function isPublicAuthRoute(pathname: string) {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/olvide-contrasena") ||
    pathname.startsWith("/auth/callback")
  );
}

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS),
  });
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isOnboarding = pathname.startsWith("/onboarding");
  const authCode = request.nextUrl.searchParams.get("code");

  // Auth emails sometimes land on Site URL /login with ?code= instead of /auth/callback.
  if (authCode && !pathname.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";

    const type = request.nextUrl.searchParams.get("type");
    const hasNext = Boolean(request.nextUrl.searchParams.get("next"));

    if (!hasNext && (type === "recovery" || pathname.startsWith("/login"))) {
      url.searchParams.set("next", "/recuperar-contrasena");
    }

    return NextResponse.redirect(url);
  }

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
      global: {
        fetch: fetchWithTimeout,
      },
    },
  );

  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    console.error("[middleware] getUser timed out or failed", error);
  }

  if (!user && !isPublicAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isPublicAuthRoute(pathname) && !pathname.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
