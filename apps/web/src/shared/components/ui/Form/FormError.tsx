"use client";

import { Box } from "@mui/material";
import { CircleAlert } from "lucide-react";
import { aurora } from "@/shared/theme";
import { useFormContext } from "./FormContext";

export function FormError() {
  const { error } = useFormContext();

  if (!error) return null;

  return (
    <Box
      role="alert"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        mb: 3,
        px: 1.75,
        py: 1.25,
        borderRadius: aurora.radii.sm,
        background: "oklch(0.74 0.145 18 / 0.1)",
        border: "1px solid oklch(0.74 0.145 18 / 0.3)",
        color: aurora.status.fail,
        fontFamily: aurora.font.ui,
        fontSize: "13.5px",
        fontWeight: 500,
        lineHeight: 1.45,
      }}
    >
      <CircleAlert size={18} style={{ flex: "none" }} />
      <span>{error}</span>
    </Box>
  );
}
