import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "./lib/auth/cookies";
import { refreshAccessToken, type RefreshResult } from "./lib/auth/refresh";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/feed",
  "/explore",
  "/roadmaps",
  "/documents",
  "/profile",
  "/admin",
];

const GUEST_ONLY_PREFIXES = ["/login", "/register"];

const hasPrefix = (pathname: string, prefixes: string[]): boolean =>
  prefixes.some((p) => pathname.startsWith(p));

const redirectTo = (request: NextRequest, pathname: string): NextResponse => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
};

const attachRefreshed = (
  response: NextResponse,
  refreshed: RefreshResult | null,
): NextResponse => {
  refreshed?.setCookies.forEach((c) =>
    response.headers.append("set-cookie", c),
  );
  return response;
};

async function refreshIfNeeded(
  request: NextRequest,
): Promise<RefreshResult | null> {
  if (request.cookies.get(AUTH_COOKIE.access)?.value) return null;
  const refreshToken = request.cookies.get(AUTH_COOKIE.refresh)?.value;
  if (!refreshToken) return null;

  const refreshed = await refreshAccessToken(refreshToken);
  if (!refreshed) return null;

  const { access, refresh } = refreshed.tokens;
  if (access) request.cookies.set(AUTH_COOKIE.access, access);
  if (refresh) request.cookies.set(AUTH_COOKIE.refresh, refresh);
  return refreshed;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshed = await refreshIfNeeded(request);
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE.access)?.value);

  const noSessionTryingProtected =
    !hasSession && hasPrefix(pathname, PROTECTED_PREFIXES);
  const hasSessionTryingGuestOnly =
    hasSession && hasPrefix(pathname, GUEST_ONLY_PREFIXES);

  if (noSessionTryingProtected) {
    return redirectTo(request, "/login");
  }
  if (hasSessionTryingGuestOnly) {
    return attachRefreshed(redirectTo(request, "/dashboard"), refreshed);
  }
  return attachRefreshed(NextResponse.next({ request }), refreshed);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
