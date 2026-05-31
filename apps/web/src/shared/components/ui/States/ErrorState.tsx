"use client";

import { Box } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../Button/Button";
import { ButtonVariants, ButtonIconPositions } from "@/shared/types";
import { aurora, auroraTint } from "@/shared/theme";

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
        fontFamily: aurora.font.ui,
      }}
    >
      <Box
        sx={{
          width: 84,
          height: 84,
          borderRadius: "20px",
          display: "grid",
          placeItems: "center",
          background: auroraTint(aurora.status.fail, 0.14),
          border: `1px solid ${auroraTint(aurora.status.fail, 0.3)}`,
          color: aurora.status.fail,
          boxShadow: `0 0 28px -8px ${auroraTint(aurora.status.fail, 0.55)}`,
          mb: 3,
        }}
      >
        <Icon size={36} strokeWidth={1.5} />
      </Box>

      <Box
        component="h3"
        sx={{
          fontFamily: aurora.font.display,
          color: aurora.txHi,
          fontWeight: 700,
          fontSize: "22px",
          letterSpacing: "-0.015em",
          margin: 0,
          mb: "8px",
        }}
      >
        {title}
      </Box>

      <Box
        component="p"
        sx={{
          color: aurora.txMid,
          fontSize: "14.5px",
          lineHeight: 1.55,
          maxWidth: 360,
          margin: 0,
          mb: onRetry ? 3 : 0,
          textWrap: "pretty",
        }}
      >
        {description}
      </Box>

      {onRetry && (
        <Button
          label={retryLabel}
          onClick={onRetry}
          icon={RefreshCw}
          iconPos={ButtonIconPositions.START}
          variant={ButtonVariants.AURORA_OUTLINE}
        />
      )}
    </Box>
  );
}
