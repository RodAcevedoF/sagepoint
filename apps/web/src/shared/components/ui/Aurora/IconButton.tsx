"use client";

import { IconButton as MuiIconButton } from "@mui/material";
import type { MouseEventHandler, ReactNode } from "react";
import { aurora as auroraPalette } from "@/shared/theme";

interface IconButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  ariaLabel: string;
  /** Accent variant — uses the card's `--accent` CSS var for the icon color. */
  go?: boolean;
  disabled?: boolean;
}

/**
 * Aurora icon button. Wraps MUI IconButton for ripple + a11y; visuals are
 * driven by sx + the surrounding card's `--accent` token (when `go`).
 */
export function IconButton({
  children,
  onClick,
  title,
  ariaLabel,
  go = false,
  disabled = false,
}: IconButtonProps) {
  return (
    <MuiIconButton
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      disableRipple
      sx={{
        width: 34,
        height: 34,
        borderRadius: "9px",
        padding: 0,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        background: "transparent",
        border: "1px solid transparent",
        color: go ? "var(--accent)" : auroraPalette.txLow,
        transition:
          "background-color .3s ease, color .3s ease, border-color .3s ease, transform .3s cubic-bezier(0.22, 1, 0.36, 1)",
        "&:hover": {
          background: auroraPalette.surface2,
          color: go ? "var(--accent)" : auroraPalette.txHi,
          borderColor: auroraPalette.line,
          transform: "translateY(-1px)",
        },
      }}
    >
      {children}
    </MuiIconButton>
  );
}
