import { withRetry, isRetryableError, extractRetryAfterMs } from "../src/retry";

class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly headers: Record<string, string> = {},
    message?: string,
  ) {
    super(message ?? `HTTP ${status}`);
  }
}

class NetworkError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

function createLogger(): { warn: jest.Mock } {
  return { warn: jest.fn() };
}

describe("isRetryableError", () => {
  it("treats 429 + 5xx as retryable", () => {
    expect(isRetryableError(new HttpError(429))).toBe(true);
    expect(isRetryableError(new HttpError(500))).toBe(true);
    expect(isRetryableError(new HttpError(503))).toBe(true);
  });

  it("treats other 4xx as non-retryable", () => {
    expect(isRetryableError(new HttpError(400))).toBe(false);
    expect(isRetryableError(new HttpError(401))).toBe(false);
    expect(isRetryableError(new HttpError(404))).toBe(false);
  });

  it("treats network errors as retryable", () => {
    expect(isRetryableError(new NetworkError("ECONNRESET"))).toBe(true);
    expect(isRetryableError(new NetworkError("ETIMEDOUT"))).toBe(true);
    expect(isRetryableError(new Error("fetch failed"))).toBe(true);
  });

  it("treats LangChain TimeoutError as retryable", () => {
    const err = new Error("Request timed out.");
    err.name = "TimeoutError";
    expect(isRetryableError(err)).toBe(true);
    expect(isRetryableError(new Error("Request timed out."))).toBe(true);
  });

  it("treats validation errors as non-retryable", () => {
    expect(isRetryableError(new TypeError("ZodError"))).toBe(false);
    expect(isRetryableError(new Error("UnsafeUserText"))).toBe(false);
  });
});

describe("extractRetryAfterMs", () => {
  it("reads numeric retry-after as seconds", () => {
    expect(
      extractRetryAfterMs(new HttpError(429, { "retry-after": "2" })),
    ).toBe(2000);
  });

  it("reads HTTP-date retry-after", () => {
    const future = new Date(Date.now() + 3000).toUTCString();
    const ms = extractRetryAfterMs(
      new HttpError(429, { "retry-after": future }),
    );
    expect(ms).not.toBeNull();
    expect(ms).toBeGreaterThan(1000);
    expect(ms).toBeLessThanOrEqual(3000);
  });

  it("returns null when missing", () => {
    expect(extractRetryAfterMs(new HttpError(500))).toBeNull();
    expect(extractRetryAfterMs(new Error("x"))).toBeNull();
  });
});

describe("withRetry", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.useRealTimers();
    (Math.random as jest.Mock).mockRestore?.();
  });

  it("returns immediately on first-attempt success", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    const logger = createLogger();
    await expect(withRetry(fn, { logger })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("retries on 429 and honors retry-after header", async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new HttpError(429, { "retry-after": "2" }))
      .mockResolvedValue("ok");
    const logger = createLogger();

    const promise = withRetry(fn, { logger, opName: "test" });
    await jest.advanceTimersByTimeAsync(2000);
    await expect(promise).resolves.toBe("ok");

    expect(fn).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn.mock.calls[0][0]).toMatchObject({
      opName: "test",
      attempt: 1,
      nextAttemptInMs: 2000,
      reason: "status 429",
    });
  });

  it("retries on 5xx with backoff inside the configured cap", async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new HttpError(500))
      .mockRejectedValueOnce(new HttpError(503))
      .mockResolvedValue("ok");
    const logger = createLogger();

    const promise = withRetry(fn, {
      logger,
      baseDelayMs: 500,
      maxDelayMs: 8000,
    });

    // attempt 1: backoff = floor(0.5 * 500) = 250
    await jest.advanceTimersByTimeAsync(250);
    // attempt 2: backoff = floor(0.5 * 1000) = 500
    await jest.advanceTimersByTimeAsync(500);

    await expect(promise).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  it("rethrows after exhausting attempts on persistent 500", async () => {
    const err = new HttpError(500);
    const fn = jest.fn().mockRejectedValue(err);
    const logger = createLogger();

    const promise = withRetry(fn, {
      logger,
      maxAttempts: 3,
      baseDelayMs: 100,
    });
    const assertion = expect(promise).rejects.toBe(err);
    await jest.runAllTimersAsync();
    await assertion;

    expect(fn).toHaveBeenCalledTimes(3);
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  it("does not retry on 400", async () => {
    const err = new HttpError(400);
    const fn = jest.fn().mockRejectedValue(err);
    const logger = createLogger();

    await expect(withRetry(fn, { logger })).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("does not retry on ZodError-like validation errors", async () => {
    const err = Object.assign(new Error("bad"), { name: "ZodError" });
    const fn = jest.fn().mockRejectedValue(err);

    await expect(withRetry(fn)).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("throws immediately when signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const fn = jest.fn().mockResolvedValue("ok");

    await expect(
      withRetry(fn, { signal: controller.signal }),
    ).rejects.toBeDefined();
    expect(fn).not.toHaveBeenCalled();
  });

  it("aborts mid-backoff when signal fires", async () => {
    const controller = new AbortController();
    const fn = jest.fn().mockRejectedValue(new HttpError(500));
    const logger = createLogger();

    const promise = withRetry(fn, {
      logger,
      signal: controller.signal,
      baseDelayMs: 1000,
    });

    // start the first backoff sleep then abort mid-flight
    await Promise.resolve();
    controller.abort();
    await expect(promise).rejects.toBeDefined();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
