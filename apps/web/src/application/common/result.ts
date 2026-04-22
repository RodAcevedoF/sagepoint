export type Result<T, E = CommandError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export interface CommandError {
  status?: number;
  message: string;
  cause?: unknown;
  tag?: string;
}

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = (error: CommandError): Result<never> => ({
  ok: false,
  error,
});
