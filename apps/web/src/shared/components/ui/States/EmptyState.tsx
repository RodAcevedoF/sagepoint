"use client";

import { Box, Typography, alpha } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "../Button/Button";
import { ButtonVariants, ButtonIconPositions } from "@/shared/types";
import { palette } from "@/shared/theme";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  inline?: boolean;
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon: Icon = Inbox,
  actionLabel,
  actionIcon,
  onAction,
  inline = false,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: inline ? 3 : 8,
        px: inline ? 2 : 4,
        flex: 1,
      }}
    >
      <Box
        sx={{
          width: inline ? 48 : 80,
          height: inline ? 48 : 80,
          borderRadius: inline ? 3 : 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(palette.primary.main, 0.1),
          color: palette.primary.light,
          mb: inline ? 1.5 : 3,
        }}
      >
        <Icon size={inline ? 24 : 40} strokeWidth={1.5} />
      </Box>

      <Typography
        variant={inline ? "subtitle2" : "h5"}
        sx={{
          color: palette.text.primary,
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant={inline ? "caption" : "body1"}
          sx={{
            color: palette.text.secondary,
            maxWidth: inline ? 240 : 320,
            mb: actionLabel ? (inline ? 2 : 3) : 0,
          }}
        >
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onClick={onAction}
          icon={actionIcon}
          iconPos={ButtonIconPositions.START}
          variant={ButtonVariants.DEFAULT}
        />
      )}
    </Box>
  );
}
