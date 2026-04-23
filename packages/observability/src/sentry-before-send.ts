import type { ErrorEvent, EventHint } from "@sentry/core";

type ErrorLike = {
  status?: number;
  statusCode?: number;
  code?: string | number;
  name?: string;
  message?: string;
  cause?: unknown;
};

const NETWORK_TRANSIENT_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EPIPE",
]);

const TRANSIENT_ERROR_NAMES = new Set([
  "RateLimitError",
  "APIConnectionError",
  "APIConnectionTimeoutError",
  "InternalServerError",
  "ServiceUnavailableError",
  "EmailRateLimitError",
]);

function unwrap(err: unknown): ErrorLike | null {
  if (!err || typeof err !== "object") return null;
  return err as ErrorLike;
}

function statusOf(e: ErrorLike): number | undefined {
  return e.status ?? e.statusCode;
}

export function isNoisyError(err: unknown): boolean {
  const e = unwrap(err);
  if (!e) return false;

  const status = statusOf(e);

  if (status === 429 || status === 503) return true;

  if (typeof e.code === "string" && NETWORK_TRANSIENT_CODES.has(e.code)) {
    return true;
  }

  if (e.name && TRANSIENT_ERROR_NAMES.has(e.name)) return true;

  if (
    (status === 404 || e.code === 404 || e.code === "404") &&
    (e.name === "ApiError" || /no such object/i.test(e.message ?? ""))
  ) {
    return true;
  }

  const cause = unwrap(e.cause);
  if (cause) return isNoisyError(cause);

  return false;
}

export function sentryBeforeSend(
  event: ErrorEvent,
  hint: EventHint,
): ErrorEvent | null {
  if (isNoisyError(hint?.originalException)) return null;
  return event;
}
