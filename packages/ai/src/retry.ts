export interface RetryLogger {
  warn(...args: unknown[]): void;
}

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  signal?: AbortSignal;
  logger?: RetryLogger;
  opName?: string;
}

const DEFAULTS = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 8_000,
} as const;

const RETRYABLE_NETWORK_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPIPE",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
]);

function getErrorStatus(err: unknown): number | null {
  if (err === null || typeof err !== "object") return null;
  const status = (err as { status?: unknown }).status;
  if (typeof status === "number") return status;
  const code = (err as { code?: unknown }).code;
  if (typeof code === "number") return code;
  const response = (err as { response?: { status?: unknown } }).response;
  if (response && typeof response.status === "number") return response.status;
  return null;
}

function isAbortError(err: unknown): boolean {
  if (err === null || typeof err !== "object") return false;
  const name = (err as { name?: unknown }).name;
  return name === "AbortError";
}

function isNetworkError(err: unknown): boolean {
  if (err === null || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  if (typeof code === "string" && RETRYABLE_NETWORK_CODES.has(code))
    return true;
  const name = (err as { name?: unknown }).name;
  if (name === "TimeoutError") return true;
  const message = (err as { message?: unknown }).message;
  if (typeof message === "string") {
    const lower = message.toLowerCase();
    if (lower.includes("fetch failed")) return true;
    if (lower.includes("socket hang up")) return true;
    if (lower.includes("network error")) return true;
    if (lower.includes("timed out")) return true;
  }
  return false;
}

export function isRetryableError(err: unknown): boolean {
  if (isNetworkError(err)) return true;
  const status = getErrorStatus(err);
  if (status === null) return false;
  if (status === 429) return true;
  if (status >= 500 && status <= 599) return true;
  return false;
}

function readHeader(headers: unknown, name: string): string | null {
  if (headers === null || typeof headers !== "object") return null;
  const direct = (headers as Record<string, unknown>)[name];
  if (typeof direct === "string") return direct;
  if (typeof direct === "number") return String(direct);
  const lower = (headers as Record<string, unknown>)[name.toLowerCase()];
  if (typeof lower === "string") return lower;
  if (typeof lower === "number") return String(lower);
  const obj = headers as { get?: (k: string) => string | null };
  if (typeof obj.get === "function") {
    const v = obj.get(name);
    if (typeof v === "string") return v;
  }
  return null;
}

export function extractRetryAfterMs(err: unknown): number | null {
  if (err === null || typeof err !== "object") return null;
  const candidates: unknown[] = [
    (err as { headers?: unknown }).headers,
    (err as { response?: { headers?: unknown } }).response?.headers,
  ];
  for (const headers of candidates) {
    const raw = readHeader(headers, "retry-after");
    if (raw === null) continue;
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.floor(seconds * 1000);
    }
    const dateMs = Date.parse(raw);
    if (!Number.isNaN(dateMs)) {
      const delta = dateMs - Date.now();
      if (delta > 0) return delta;
    }
  }
  return null;
}

function computeBackoffMs(attempt: number, base: number, cap: number): number {
  const exp = Math.min(cap, base * 2 ** (attempt - 1));
  return Math.floor(Math.random() * exp);
}

function describeReason(err: unknown): string {
  const status = getErrorStatus(err);
  if (status !== null) return `status ${status}`;
  if (err !== null && typeof err === "object") {
    const code = (err as { code?: unknown }).code;
    if (typeof code === "string") return code;
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "unknown";
}

function abortError(signal: AbortSignal): Error {
  if (signal.reason instanceof Error) return signal.reason;
  if (signal.reason !== undefined) {
    return new Error(String(signal.reason));
  }
  const err = new Error("Aborted");
  err.name = "AbortError";
  return err;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal === undefined) {
      setTimeout(resolve, ms);
      return;
    }
    if (signal.aborted) {
      reject(abortError(signal));
      return;
    }
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(abortError(signal));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? DEFAULTS.maxAttempts;
  const baseDelayMs = opts.baseDelayMs ?? DEFAULTS.baseDelayMs;
  const maxDelayMs = opts.maxDelayMs ?? DEFAULTS.maxDelayMs;
  const logger: RetryLogger = opts.logger ?? console;
  const opName = opts.opName ?? "withRetry";

  if (opts.signal?.aborted) throw abortError(opts.signal);

  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      return await fn();
    } catch (err) {
      if (isAbortError(err) && opts.signal?.aborted) throw err;
      if (attempt >= maxAttempts) throw err;
      if (!isRetryableError(err)) throw err;

      const retryAfter = extractRetryAfterMs(err);
      const delay =
        retryAfter !== null
          ? Math.min(retryAfter, maxDelayMs)
          : computeBackoffMs(attempt, baseDelayMs, maxDelayMs);

      logger.warn(
        {
          opName,
          attempt,
          nextAttemptInMs: delay,
          reason: describeReason(err),
        },
        "withRetry: upstream failure, retrying",
      );

      await sleep(delay, opts.signal);
    }
  }
}
