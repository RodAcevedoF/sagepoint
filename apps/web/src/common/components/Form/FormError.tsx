"use client";

import { Alert } from "@mui/material";
import { useFormContext } from "./FormContext";

export function FormError() {
  const { error } = useFormContext();

  if (!error) return null;

  return (
    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
      {error}
    </Alert>
  );
}
