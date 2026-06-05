import { AUTH_COOKIE } from "./cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface RefreshResult {
  /** Raw Set-Cookie headers from the API — forward verbatim to the browser. */
  setCookies: string[];
  /** Parsed token values — for mutating same-request cookies so SSR sees them. */
  tokens: { access?: string; refresh?: string };
}

function findCookieValue(
  setCookies: string[],
  name: string,
): string | undefined {
  const prefix = `${name}=`;
  const match = setCookies.find((c) => c.startsWith(prefix));
  if (!match) return undefined;
  const rest = match.slice(prefix.length);
  const semi = rest.indexOf(";");
  return semi < 0 ? rest : rest.slice(0, semi);
}

/**
 * Calls the API refresh endpoint with the supplied refresh-token cookie value.
 * Returns null if the API rejects the refresh or no Set-Cookie comes back.
 * Used by the Next.js proxy/middleware to keep SSR sessions sticky across
 * the 15-minute access-token TTL — without this, `loadSession` would treat
 * an expired access cookie as logged-out even when refresh is still valid.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshResult | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `${AUTH_COOKIE.refresh}=${refreshToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const setCookies = res.headers.getSetCookie();
    if (setCookies.length === 0) return null;

    return {
      setCookies,
      tokens: {
        access: findCookieValue(setCookies, AUTH_COOKIE.access),
        refresh: findCookieValue(setCookies, AUTH_COOKIE.refresh),
      },
    };
  } catch {
    return null;
  }
}
