"use client";

import { Box, Typography, alpha } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/common/components/Button/Button";
import { ButtonVariants, ButtonIconPositions } from "@/common/types";
import { palette } from "@/common/theme";

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  icon: Icon = AlertTriangle,
  onRetry,
  retryLabel = "Try again",
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 8,
        px: 4,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(palette.error.main, 0.1),
          color: palette.error.light,
          mb: 3,
        }}
      >
        <Icon size={40} strokeWidth={1.5} />
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: palette.text.primary,
          fontWeight: 600,
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: palette.text.secondary,
          maxWidth: 320,
          mb: onRetry ? 3 : 0,
        }}
      >
        {description}
      </Typography>

      {onRetry && (
        <Button
          label={retryLabel}
          onClick={onRetry}
          icon={RefreshCw}
          iconPos={ButtonIconPositions.START}
          variant={ButtonVariants.OUTLINED}
        />
      )}
    </Box>
  );
}
