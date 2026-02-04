"use client";

import { type ReactNode, useCallback, useMemo, useState } from "react";
import { Snackbar } from "./Snackbar";
import {
  SnackbarContext,
  type SnackbarItem,
  type SnackbarOptions,
} from "./snackbar-context";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_DURATION = 5000;
const MAX_SNACKBARS = 5;

// ============================================================================
// Provider
// ============================================================================

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);

  const showSnackbar = useCallback(
    (message: string, options?: SnackbarOptions): string => {
      const id = crypto.randomUUID();

      const newSnackbar: SnackbarItem = {
        id,
        message,
        severity: options?.severity ?? "info",
        duration: options?.duration ?? DEFAULT_DURATION,
        action: options?.action,
      };

      setSnackbars((prev) => {
        const updated = [...prev, newSnackbar];
        // Limit max visible snackbars
        return updated.slice(-MAX_SNACKBARS);
      });

      return id;
    },
    []
  );

  const hideSnackbar = useCallback((id: string) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSnackbars([]);
  }, []);

  const value = useMemo(
    () => ({ snackbars, showSnackbar, hideSnackbar, clearAll }),
    [snackbars, showSnackbar, hideSnackbar, clearAll]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar />
    </SnackbarContext.Provider>
  );
}
