"use client";

import {
  Button as MuiButton,
  CircularProgress,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ButtonVariants,
  ButtonTypes,
  ButtonIconPositions,
  ButtonSizes,
} from "@/common/types";
import { palette } from "@/common/theme";

const styles = {
  base: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    fontWeight: 500,
    transition: "all 0.2s ease-in-out",
  },
  default: {
    bgcolor: palette.primary.main,
    color: palette.primary.light,
    "&:hover": {
      bgcolor: palette.primary.dark,
      color: "#fff",
    },
  },
  secondary: {
    bgcolor: palette.secondary.main,
    color: palette.primary.light,
    "&:hover": {
      bgcolor: palette.secondary.dark,
      color: "#fff",
    },
  },
  outlined: {
    bgcolor: "transparent",
    color: palette.primary.light,
    border: "1px solid",
    borderColor: palette.primary.main,
    "&:hover": {
      bgcolor: "rgba(53, 162, 159, 0.1)",
      borderColor: palette.primary.light,
    },
  },
  ghost: {
    bgcolor: "transparent",
    color: palette.text.secondary,
    "&:hover": {
      bgcolor: "rgba(151, 254, 237, 0.08)",
      color: palette.text.primary,
    },
  },
  danger: {
    bgcolor: palette.error.main,
    color: "#fff",
    "&:hover": {
      bgcolor: palette.error.dark,
    },
  },
  small: {
    px: 2,
    py: 0.75,
    fontSize: "0.875rem",
  },
  medium: {
    px: 3,
    py: 1,
    fontSize: "1rem",
  },
  large: {
    px: 4,
    py: 1.5,
    fontSize: "1.125rem",
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  loaderText: {
    ml: 1,
  },
} satisfies Record<string, SxProps<Theme>>;

interface ButtonProps {
  label?: string | ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  type?: ButtonTypes;
  variant?: ButtonVariants;
  size?: ButtonSizes;
  iconPos?: ButtonIconPositions;
  loading?: boolean;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  iconSx?: React.CSSProperties;
  testId?: string;
}

export function Button({
  label,
  onClick,
  disabled = false,
  icon: Icon,
  type = ButtonTypes.BUTTON,
  variant = ButtonVariants.DEFAULT,
  size = ButtonSizes.MEDIUM,
  iconPos = ButtonIconPositions.END,
  loading = false,
  fullWidth = false,
  sx = {},
  iconSx = {},
  testId = "button",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getVariantStyles = (): SxProps<Theme> => {
    switch (variant) {
      case ButtonVariants.SECONDARY:
        return styles.secondary;
      case ButtonVariants.OUTLINED:
        return styles.outlined;
      case ButtonVariants.GHOST:
        return styles.ghost;
      case ButtonVariants.DANGER:
        return styles.danger;
      default:
        return styles.default;
    }
  };

  const getSizeStyles = (): SxProps<Theme> => {
    switch (size) {
      case ButtonSizes.SMALL:
        return styles.small;
      case ButtonSizes.LARGE:
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const buttonStyles: SxProps<Theme> = [
    styles.base,
    getVariantStyles(),
    getSizeStyles(),
    isDisabled && styles.disabled,
    fullWidth && { width: "100%" },
    ...(Array.isArray(sx) ? sx : [sx]),
  ];

  return (
    <MuiButton
      data-testid={testId}
      onClick={onClick}
      disabled={isDisabled}
      type={type}
      sx={buttonStyles}
    >
      {iconPos === ButtonIconPositions.START && Icon && (
        <Icon size={18} style={iconSx} />
      )}
      {loading && <CircularProgress size={18} sx={{ color: "inherit" }} />}
      {loading ? (
        <Typography component="span" sx={styles.loaderText}>
          {label}
        </Typography>
      ) : (
        label
      )}
      {iconPos === ButtonIconPositions.END && Icon && (
        <Icon size={18} style={iconSx} />
      )}
    </MuiButton>
  );
}
