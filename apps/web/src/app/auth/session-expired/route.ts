import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookies } from "@/lib/auth/cookies";

/**
 * Clears stale auth cookies and sends the user back to /login.
 *
 * Used when a Server Component detects that the session cookie exists but is
 * no longer valid (e.g. expired access token, revoked refresh token). Server
 * Components can't mutate cookies, so we bounce through this Route Handler.
 */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  clearAuthCookies(cookieStore);

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
