"use client";

import { useState, useCallback } from "react";
import type { Result, CommandError } from "./result";
import { ok, err } from "./result";
import { normalizeError } from "./normalize-error";

type MutationTrigger<TArg, TData> = (arg: TArg) => {
  unwrap: () => Promise<TData>;
};

type MutationHook<TArg, TData> = () => readonly [
  MutationTrigger<TArg, TData>,
  { isLoading: boolean; reset: () => void },
];

export interface UseCommandOptions<TArg, TData> {
  mapError?: (e: CommandError) => CommandError;
  onSuccess?: (data: TData, arg: TArg) => void | Promise<void>;
  onError?: (error: CommandError, arg: TArg) => void | Promise<void>;
}

export interface CommandHook<TArg, TData> {
  execute: (arg: TArg) => Promise<Result<TData>>;
  isLoading: boolean;
  error: CommandError | null;
  reset: () => void;
}

export function useCommand<TArg, TData>(
  useMutation: MutationHook<TArg, TData>,
  options: UseCommandOptions<TArg, TData> = {},
): CommandHook<TArg, TData> {
  const [trigger, { isLoading, reset: rtkReset }] = useMutation();
  const [error, setError] = useState<CommandError | null>(null);

  const reset = useCallback(() => {
    setError(null);
    rtkReset();
  }, [rtkReset]);

  const execute = useCallback(
    async (arg: TArg): Promise<Result<TData>> => {
      try {
        const data = await trigger(arg).unwrap();
        setError(null);
        await options.onSuccess?.(data, arg);
        return ok(data);
      } catch (raw) {
        const normalized = normalizeError(raw);
        const mapped = options.mapError
          ? options.mapError(normalized)
          : normalized;
        setError(mapped);
        await options.onError?.(mapped, arg);
        return err(mapped);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trigger, options.mapError, options.onSuccess, options.onError],
  );

  return { execute, isLoading, error, reset };
}
