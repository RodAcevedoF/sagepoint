"use client";

import { logoutAction } from "@/app/actions/auth";

/**
 * Ends the session. Always triggers a full page navigation so every piece of
 * in-memory state (Redux, RTK Query cache, SSE, timers) is torn down — the
 * only way to guarantee no data from the previous session leaks into the next.
 */
export async function logout(): Promise<void> {
  try {
    await logoutAction();
  } finally {
    window.location.assign("/login");
  }
}
