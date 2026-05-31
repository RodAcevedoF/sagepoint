"use client";

import { Box } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "../Button/Button";
import { ButtonVariants, ButtonIconPositions } from "@/shared/types";
import { aurora, auroraTint } from "@/shared/theme";

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
        fontFamily: aurora.font.ui,
      }}
    >
      <Box
        sx={{
          width: inline ? 52 : 84,
          height: inline ? 52 : 84,
          borderRadius: inline ? aurora.radii.md : "20px",
          display: "grid",
          placeItems: "center",
          background: auroraTint(aurora.teal, 0.14),
          border: `1px solid ${auroraTint(aurora.teal, 0.28)}`,
          color: aurora.teal,
          boxShadow: `0 0 28px -8px ${auroraTint(aurora.teal, 0.55)}`,
          mb: inline ? 1.75 : 3,
        }}
      >
        <Icon size={inline ? 22 : 36} strokeWidth={1.5} />
      </Box>

      <Box
        component={inline ? "h4" : "h3"}
        sx={{
          fontFamily: aurora.font.display,
          color: aurora.txHi,
          fontWeight: 700,
          fontSize: inline ? "16px" : "22px",
          letterSpacing: "-0.015em",
          margin: 0,
          mb: "6px",
        }}
      >
        {title}
      </Box>

      {description && (
        <Box
          component="p"
          sx={{
            color: aurora.txMid,
            fontSize: inline ? "13px" : "14.5px",
            lineHeight: 1.55,
            maxWidth: inline ? 260 : 360,
            margin: 0,
            mb: actionLabel ? (inline ? 2 : 3) : 0,
            textWrap: "pretty",
          }}
        >
          {description}
        </Box>
      )}

      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onClick={onAction}
          icon={actionIcon}
          iconPos={ButtonIconPositions.START}
          variant={ButtonVariants.AURORA}
        />
      )}
    </Box>
  );
}
