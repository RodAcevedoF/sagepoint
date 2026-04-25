"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  authCookieOptions,
  buildAuthCookieHeader,
  clearAuthCookies,
} from "@/lib/auth/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface AuthActionState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { error: errData.message || "Invalid credentials" };
    }

    const data = await response.json();
    const cookieStore = await cookies();
    cookieStore.set(
      AUTH_COOKIE.access,
      data.accessToken,
      authCookieOptions(ACCESS_TOKEN_MAX_AGE),
    );
    cookieStore.set(
      AUTH_COOKIE.refresh,
      data.refreshToken,
      authCookieOptions(REFRESH_TOKEN_MAX_AGE),
    );
  } catch {
    return { error: "Network error. Please try again." };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const invitationToken = formData.get("invitationToken") as string | null;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  const body: Record<string, string> = { name, email, password };
  if (invitationToken) body.invitationToken = invitationToken;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { error: data.message || "Registration failed" };
    }
  } catch {
    return { error: "Network error. Please try again." };
  }

  redirect("/login?registered=true");
}

/**
 * Logout is local-authoritative: we always clear the browser cookies, even if
 * the API call to invalidate the refresh token fails. If the access token is
 * already expired the API call no-ops (401) and the refresh token expires on
 * its own 7-day TTL server-side.
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const access = cookieStore.get(AUTH_COOKIE.access)?.value;
  const refresh = cookieStore.get(AUTH_COOKIE.refresh)?.value;

  if (access) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Cookie: buildAuthCookieHeader(access, refresh) },
    }).catch(() => {});
  }

  clearAuthCookies(cookieStore);
}
