"use client";

import { useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

type Severity = "success" | "error";

export function useAdminSnackbar() {
  const [state, setState] = useState<{
    open: boolean;
    message: string;
    severity: Severity;
  }>({ open: false, message: "", severity: "success" });

  const show = useCallback((message: string, severity: Severity) => {
    setState({ open: true, message, severity });
  }, []);

  const SnackbarAlert = (
    <Snackbar
      open={state.open}
      autoHideDuration={3000}
      onClose={() => setState((s) => ({ ...s, open: false }))}
    >
      <Alert severity={state.severity} variant="filled">
        {state.message}
      </Alert>
    </Snackbar>
  );

  return { show, SnackbarAlert };
}
