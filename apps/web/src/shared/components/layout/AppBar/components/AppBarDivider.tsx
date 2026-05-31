"use client";

import { Box } from "@mui/material";
import { aurora } from "@/shared/theme";

export function AppBarDivider() {
  return (
    <Box
      sx={{
        zIndex: 1,
        width: "1px",
        alignSelf: "center",
        height: 24,
        mx: "4px",
        background: aurora.line2,
      }}
    />
  );
}
