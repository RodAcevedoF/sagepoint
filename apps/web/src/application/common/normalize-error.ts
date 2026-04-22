import type { CommandError } from "./result";

export function normalizeError(raw: unknown): CommandError {
  if (raw == null) return { message: "Unknown error" };

  // RTK FetchBaseQueryError: { status: number | string, data: unknown }
  if (typeof raw === "object" && "status" in raw) {
    const e = raw as { status: number | string; data?: unknown };
    const status = typeof e.status === "number" ? e.status : undefined;
    const data = e.data;
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : typeof data === "string"
          ? data
          : "Request failed";
    return { status, message, cause: raw };
  }

  // Standard Error
  if (raw instanceof Error) return { message: raw.message, cause: raw };

  // String
  if (typeof raw === "string") return { message: raw, cause: raw };

  return { message: "Unknown error", cause: raw };
}
