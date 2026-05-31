"use client";

import { Box } from "@mui/material";
import { aurora } from "@/shared/theme";
import type { FormHeaderProps } from "./Form.types";

export function FormHeader({ title, subtitle }: FormHeaderProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
      <Box
        component="h1"
        sx={{
          fontFamily: aurora.font.display,
          fontWeight: 700,
          fontSize: { xs: "26px", md: "30px" },
          lineHeight: 1.15,
          letterSpacing: "-0.012em",
          textAlign: "center",
          background: `linear-gradient(180deg, ${aurora.txHi} 30%, ${aurora.txMid} 100%)`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: 0,
          mb: 1,
        }}
      >
        {title}
      </Box>
      {subtitle && (
        <Box
          component="p"
          sx={{
            fontFamily: aurora.font.ui,
            fontSize: { xs: "14px", md: "14.5px" },
            lineHeight: 1.5,
            color: aurora.txMid,
            textAlign: "center",
            margin: 0,
          }}
        >
          {subtitle}
        </Box>
      )}
    </Box>
  );
}
