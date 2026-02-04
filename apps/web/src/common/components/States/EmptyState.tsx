"use client";

import { Box, Typography, alpha } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/common/components/Button/Button";
import { ButtonVariants, ButtonIconPositions } from "@/common/types";
import { palette } from "@/common/theme";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon: Icon = Inbox,
  actionLabel,
  actionIcon,
  onAction,
}: EmptyStateProps) {
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
          bgcolor: alpha(palette.primary.main, 0.1),
          color: palette.primary.light,
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

      {description && (
        <Typography
          variant="body2"
          sx={{
            color: palette.text.secondary,
            maxWidth: 320,
            mb: actionLabel ? 3 : 0,
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
