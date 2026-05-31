"use client";

import {
  Button as MuiButton,
  CircularProgress,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import NextLink from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ButtonVariants,
  ButtonTypes,
  ButtonIconPositions,
  ButtonSizes,
} from "@/shared/types";
import { palette, aurora, auroraTint } from "@/shared/theme";

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
    bgcolor: "rgba(151, 254, 237, 0.07)",
    color: palette.text.secondary,
    borderRadius: "12px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      bgcolor: "rgba(151, 254, 237, 0.22)",
      color: palette.primary.light,
      transform: "translateX(-4px)",
      "& .button-icon": {
        transform: "scale(1.1)",
      },
    },
  },
  danger: {
    bgcolor: palette.error.main,
    color: "#fff",
    "&:hover": {
      bgcolor: palette.error.dark,
    },
  },
  glass: {
    bgcolor: "rgba(53, 162, 159, 0.1)",
    backdropFilter: "blur(8px)",
    color: palette.primary.light,
    border: "1px solid",
    borderColor: "rgba(151, 254, 237, 0.15)",
    "&:hover": {
      bgcolor: "rgba(53, 162, 159, 0.2)",
      borderColor: palette.primary.light,
    },
  },
  aurora: {
    background: `linear-gradient(150deg, ${aurora.teal}, ${aurora.tealDeep})`,
    color: aurora.tealInk,
    border: "none",
    borderRadius: "14px",
    fontFamily: aurora.font.ui,
    fontWeight: 700,
    boxShadow: `0 14px 34px -14px ${auroraTint(aurora.teal, 0.7)}`,
    transition:
      "transform .35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow .35s cubic-bezier(0.22, 1, 0.36, 1), filter .35s ease",
    "&:hover": {
      background: `linear-gradient(150deg, ${aurora.teal}, ${aurora.tealDeep})`,
      filter: "brightness(1.08)",
      transform: "translateY(-2px)",
      boxShadow: `0 20px 44px -14px ${auroraTint(aurora.teal, 0.85)}`,
    },
    "&:active": {
      transform: "translateY(0)",
      boxShadow: `0 10px 26px -14px ${auroraTint(aurora.teal, 0.7)}`,
    },
  },
  "aurora-ghost": {
    background: auroraTint(aurora.teal, 0.12),
    border: `1px solid ${auroraTint(aurora.teal, 0.35)}`,
    color: aurora.teal,
    borderRadius: "13px",
    fontFamily: aurora.font.ui,
    fontWeight: 700,
    transition:
      "transform .35s cubic-bezier(0.22, 1, 0.36, 1), background-color .35s ease, border-color .35s ease, box-shadow .35s ease",
    "&:hover": {
      background: auroraTint(aurora.teal, 0.2),
      borderColor: auroraTint(aurora.teal, 0.55),
      transform: "translateY(-2px)",
      boxShadow: `0 12px 28px -16px ${auroraTint(aurora.teal, 0.6)}`,
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
  "aurora-outline": {
    background: aurora.surface2,
    border: `1px solid ${aurora.line}`,
    color: aurora.txHi,
    borderRadius: "13px",
    fontFamily: aurora.font.ui,
    fontWeight: 600,
    transition:
      "background-color .15s ease, border-color .15s ease, color .15s ease",
    "&:hover": {
      background: aurora.surface3,
      borderColor: aurora.line2,
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
};

interface ButtonProps {
  label?: string | ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  trailingIcon?: LucideIcon;
  type?: ButtonTypes;
  variant?: ButtonVariants;
  size?: ButtonSizes;
  iconPos?: ButtonIconPositions;
  loading?: boolean;
  fullWidth?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  sx?: SxProps<Theme>;
  iconSx?: React.CSSProperties;
  testId?: string;
}

export function Button({
  label,
  onClick,
  disabled = false,
  icon: Icon,
  trailingIcon: TrailingIcon,
  type = ButtonTypes.BUTTON,
  variant = ButtonVariants.DEFAULT,
  size = ButtonSizes.MEDIUM,
  iconPos = ButtonIconPositions.END,
  loading = false,
  fullWidth = false,
  href,
  target,
  rel,
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
      case ButtonVariants.GLASS:
        return styles.glass;
      case ButtonVariants.DANGER:
        return styles.danger;
      case ButtonVariants.AURORA:
        return styles.aurora;
      case ButtonVariants.AURORA_GHOST:
        return styles["aurora-ghost"];
      case ButtonVariants.AURORA_OUTLINE:
        return styles["aurora-outline"];
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

  const linkProps = href
    ? {
        component: NextLink,
        href,
        target,
        rel,
      }
    : {};
  const effectiveIconPos = TrailingIcon ? ButtonIconPositions.START : iconPos;

  return (
    <MuiButton
      data-testid={testId}
      onClick={onClick}
      disabled={isDisabled}
      type={href ? undefined : type}
      sx={buttonStyles}
      {...linkProps}
    >
      {effectiveIconPos === ButtonIconPositions.START && Icon && (
        <Icon className="button-icon" size={18} style={iconSx} />
      )}
      {loading && <CircularProgress size={18} sx={{ color: "inherit" }} />}
      {loading ? (
        <Typography component="span" sx={styles.loaderText}>
          {label}
        </Typography>
      ) : (
        label
      )}
      {effectiveIconPos === ButtonIconPositions.END && Icon && (
        <Icon className="button-icon" size={18} style={iconSx} />
      )}
      {TrailingIcon && (
        <TrailingIcon className="button-icon" size={18} style={iconSx} />
      )}
    </MuiButton>
  );
}
