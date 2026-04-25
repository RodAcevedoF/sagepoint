import type { cookies } from "next/headers";

const isProd = process.env.NODE_ENV === "production";
const COOKIE_DOMAIN = isProd ? ".sagepoint.online" : undefined;

export const AUTH_COOKIE = {
  access: "access_token",
  refresh: "refresh_token",
} as const;

export const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
  };
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function clearAuthCookies(store: CookieStore): void {
  const opts = {
    path: "/",
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
  };
  store.delete({ name: AUTH_COOKIE.access, ...opts });
  store.delete({ name: AUTH_COOKIE.refresh, ...opts });
}

export function buildAuthCookieHeader(
  access: string | undefined,
  refresh: string | undefined,
): string {
  return [
    access && `${AUTH_COOKIE.access}=${access}`,
    refresh && `${AUTH_COOKIE.refresh}=${refresh}`,
  ]
    .filter(Boolean)
    .join("; ");
}
