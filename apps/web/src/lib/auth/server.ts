import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "./cookies";
import type { UserDto } from "@/infrastructure/api/authApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SessionResult =
  | { kind: "anonymous" }
  | { kind: "authenticated"; user: UserDto }
  | { kind: "invalid" }; // cookie present but server rejected it

const loadSession = cache(async (): Promise<SessionResult> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE.access)?.value;
  if (!accessToken) return { kind: "anonymous" };

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: `${AUTH_COOKIE.access}=${accessToken}` },
      cache: "no-store",
    });
    if (res.ok) {
      const user = (await res.json()) as UserDto;
      return { kind: "authenticated", user };
    }
    return { kind: "invalid" };
  } catch {
    return { kind: "invalid" };
  }
});

export async function getCurrentUser(): Promise<UserDto | null> {
  const session = await loadSession();
  return session.kind === "authenticated" ? session.user : null;
}

/**
 * Requires an authenticated user. Redirects to /login if anonymous, or through
 * /auth/session-expired (which clears cookies) if the cookie existed but is
 * stale — without that, proxy.ts would bounce us back and we'd loop.
 */
export async function requireUser(): Promise<UserDto> {
  const session = await loadSession();
  if (session.kind === "authenticated") return session.user;
  if (session.kind === "invalid") redirect("/auth/session-expired");
  redirect("/login");
}
