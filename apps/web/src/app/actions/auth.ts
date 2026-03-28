"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { error: data.message || "Invalid credentials" };
    }

    const data = await response.json();

    // Set token cookies on the server side (matching API cookie names)
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    const cookieDomain = isProduction ? ".sagepoint.online" : undefined;

    cookieStore.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes (matches API)
      ...(cookieDomain && { domain: cookieDomain }),
    });

    cookieStore.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches API)
      ...(cookieDomain && { domain: cookieDomain }),
    });
  } catch {
    return { error: "Network error. Please try again." };
  }

  redirect("/dashboard?login=success");
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

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = isProduction ? ".sagepoint.online" : undefined;

  const deleteOptions = {
    ...(cookieDomain && { domain: cookieDomain }),
    path: "/",
  };

  cookieStore.delete({ name: "access_token", ...deleteOptions });
  cookieStore.delete({ name: "refresh_token", ...deleteOptions });
}
