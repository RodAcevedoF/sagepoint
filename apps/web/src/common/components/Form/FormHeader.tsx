"use client";

import { Box, Typography, alpha } from "@mui/material";
import { palette } from "@/common/theme";
import type { FormHeaderProps } from "./Form.types";

export function FormHeader({ title, subtitle }: FormHeaderProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
      <Typography
        component="h1"
        variant="h4"
        fontWeight="800"
        textAlign="center"
        sx={{
          background: `linear-gradient(180deg, ${palette.text.primary} 30%, ${alpha(palette.text.primary, 0.7)} 100%)`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 1,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
