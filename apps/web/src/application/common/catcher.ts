import type { Result, CommandError } from "./result";
import { ok, err } from "./result";
import { normalizeError } from "./normalize-error";

export async function catcher<T>(
  fn: () => Promise<T>,
  mapError?: (e: CommandError) => CommandError,
): Promise<Result<T>> {
  try {
    const data = await fn();
    return ok(data);
  } catch (raw) {
    const normalized = normalizeError(raw);
    return err(mapError ? mapError(normalized) : normalized);
  }
}
