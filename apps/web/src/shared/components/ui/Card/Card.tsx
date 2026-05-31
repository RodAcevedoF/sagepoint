"use client";

import React, {
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { Paper, Box, alpha, type SxProps, type Theme } from "@mui/material";
import { aurora as auroraPalette, palette } from "@/shared/theme";
import {
  resolveAccent,
  type AuroraTone,
} from "@/shared/components/ui/Aurora/tones";

type CardVariant = "glass" | "outlined" | "solid" | "aurora";

interface CardProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  href?: string;
  target?: string;
  rel?: string;
  sx?: SxProps<Theme>;
  className?: string;
  style?: CSSProperties;
  variant?: CardVariant;
  hoverable?: boolean;
  /** Aurora variant only — semantic accent. */
  tone?: AuroraTone;
  /** Aurora variant only — raw accent color override. */
  accent?: string;
  /** Aurora variant only — render the soft accent glow. */
  withAura?: boolean;
}

const baseVariantStyles = (variant: Exclude<CardVariant, "aurora">) => {
  switch (variant) {
    case "glass":
      return {
        background: alpha(palette.background.paper, 0.4),
        backdropFilter: "blur(12px)",
        border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
      };
    case "outlined":
      return {
        bgcolor: "transparent",
        border: `1px solid ${alpha(palette.primary.light, 0.15)}`,
      };
    case "solid":
      return {
        bgcolor: palette.background.paper,
        border: `1px solid ${alpha(palette.divider, 1)}`,
      };
  }
};

const auroraCardSx: SxProps<Theme> = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
  width: "100%",
  borderRadius: auroraPalette.radii.card,
  border: `1px solid ${auroraPalette.line}`,
  background:
    "linear-gradient(168deg, oklch(0.235 0.026 262 / 0.92), oklch(0.175 0.026 262 / 0.82))",
  backgroundImage: undefined,
  boxShadow: auroraPalette.shadow.card,
  overflow: "hidden",
  isolation: "isolate",
  fontFamily: auroraPalette.font.ui,
  transition:
    "transform .45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow .45s cubic-bezier(0.22, 1, 0.36, 1), border-color .35s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    borderColor: auroraPalette.line2,
    boxShadow: auroraPalette.shadow.pop,
  },
  "&:hover .aurora-aura": { opacity: 0.95 },
};

const auraSx: SxProps<Theme> = {
  position: "absolute",
  top: "-40%",
  left: "-10%",
  width: "60%",
  height: "80%",
  background:
    "radial-gradient(closest-side, color-mix(in oklch, var(--accent) 26%, transparent), transparent)",
  filter: "blur(18px)",
  opacity: 0.6,
  pointerEvents: "none",
  zIndex: 0,
  transition: "opacity .45s cubic-bezier(0.22, 1, 0.36, 1)",
};

/**
 * Compound Card. `variant="aurora"` opts into the Aurora visual; other
 * variants keep the original glass/outlined/solid look.
 *
 * Aurora variant exposes: Card.Zone / Card.ZoneCat / Card.Body / Card.Head /
 * Card.HeadText / Card.Icon / Card.Title / Card.Sub / Card.Desc / Card.DataRow /
 * Card.DataCell / Card.Foot / Card.FootLeft / Card.FootDate / Card.Actions /
 * Card.FailNote.
 *
 * Non-aurora variants use: Card.Header / Card.Content / Card.Footer / Card.IconBox.
 */
export function Card({
  children,
  onClick,
  href,
  target,
  rel,
  sx,
  className,
  style,
  variant = "glass",
  hoverable = true,
  tone,
  accent,
  withAura = true,
}: CardProps) {
  const linkProps = href
    ? { component: "a" as React.ElementType, href, target, rel }
    : {};

  if (variant === "aurora") {
    const color = resolveAccent(tone, accent);
    return (
      <Paper
        elevation={0}
        component="article"
        onClick={onClick}
        className={className}
        {...linkProps}
        sx={[
          auroraCardSx,
          { cursor: onClick || href ? "pointer" : undefined },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        style={{
          ["--accent" as string]: color,
          ...style,
        }}
      >
        {withAura && <Box className="aurora-aura" sx={auraSx} />}
        {children}
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      className={className}
      {...linkProps}
      style={style}
      sx={[
        {
          position: "relative",
          overflow: "hidden",
          borderRadius: 6,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: onClick || href ? "pointer" : "default",
          ...baseVariantStyles(variant),
        },
        hoverable && {
          "&:hover": {
            transform: "translateY(-8px)",
            borderColor: alpha(palette.primary.light, 0.4),
            boxShadow: `0 20px 40px ${alpha(palette.primary.main, 0.15)}`,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Paper>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  sx?: SxProps<Theme>;
}

/* ──────────────────────────────────────────────────────────────────
   Non-aurora subcomponents (glass / outlined / solid)
   ────────────────────────────────────────────────────────────────── */

Card.Header = function CardHeader({ children, sx }: SectionProps) {
  return (
    <Box
      sx={[
        {
          p: { xs: 3, md: 4 },
          pb: 0,
          display: "flex",
          alignItems: "center",
          gap: 2,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

Card.Content = function CardContent({ children, sx }: SectionProps) {
  return (
    <Box
      sx={[
        { p: { xs: 3, md: 4 }, flexGrow: 1 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

Card.Footer = function CardFooter({ children, sx }: SectionProps) {
  return (
    <Box
      sx={[
        { p: { xs: 2, md: 3 }, pt: 0, mt: "auto" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

Card.IconBox = function CardIconBox({
  children,
  sx,
  active = false,
}: SectionProps & { active?: boolean }) {
  return (
    <Box
      className="card-icon-box"
      sx={[
        {
          width: 56,
          height: 56,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: active
            ? alpha(palette.primary.main, 0.2)
            : alpha(palette.primary.main, 0.1),
          color: palette.primary.light,
          transition: "all 0.3s ease",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

/* ──────────────────────────────────────────────────────────────────
   Aurora subcomponents — sx-only (formerly aurora.css classnames)
   ────────────────────────────────────────────────────────────────── */

Card.Zone = function CardZone({ children, sx, style }: SectionProps) {
  return (
    <Box
      sx={[
        {
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          padding: "16px 20px 0",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

interface ZoneCatProps extends SectionProps {
  icon?: ReactNode;
}

Card.ZoneCat = function CardZoneCat({
  children,
  icon,
  sx,
  style,
}: ZoneCatProps) {
  return (
    <Box
      component="span"
      sx={[
        {
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "5px 11px",
          borderRadius: auroraPalette.radii.pill,
          background: "oklch(0.27 0.02 262 / 0.55)",
          border: `1px solid ${auroraPalette.line}`,
          color: auroraPalette.txMid,
          fontFamily: auroraPalette.font.mono,
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {icon}
      {children}
    </Box>
  );
};

Card.Body = function CardBody({ children, sx, style }: SectionProps) {
  return (
    <Box
      sx={[
        {
          position: "relative",
          zIndex: 1,
          padding: "14px 22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          flex: 1,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

Card.Head = function CardHead({ children, sx, style }: SectionProps) {
  return (
    <Box
      sx={[
        {
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

Card.HeadText = function CardHeadText({
  children,
  className,
  style,
  sx,
}: SectionProps) {
  return (
    <Box
      className={className}
      sx={[{ flex: 1, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
      style={style}
    >
      {children}
    </Box>
  );
};

Card.Icon = function CardIcon({ children, sx, style }: SectionProps) {
  return (
    <Box
      component="span"
      sx={[
        {
          flex: "none",
          width: 44,
          height: 44,
          borderRadius: "13px",
          display: "grid",
          placeItems: "center",
          background:
            "color-mix(in oklch, var(--accent) 20%, " +
            auroraPalette.surface2 +
            ")",
          border:
            "1px solid color-mix(in oklch, var(--accent) 24%, transparent)",
          color: "var(--accent)",
          boxShadow:
            "0 0 22px -6px color-mix(in oklch, var(--accent) 70%, transparent)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

interface TitleProps extends SectionProps {
  title?: string;
}

Card.Title = function CardTitle({ children, style, title, sx }: TitleProps) {
  return (
    <Box
      component="h3"
      title={title}
      sx={[
        {
          fontFamily: auroraPalette.font.display,
          fontWeight: 700,
          fontSize: "21px",
          lineHeight: 1.18,
          color: auroraPalette.txHi,
          letterSpacing: "-0.012em",
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

Card.Sub = function CardSub({ children, sx, style }: SectionProps) {
  return (
    <Box
      sx={[
        {
          fontSize: "12px",
          color: auroraPalette.txLow,
          fontFamily: auroraPalette.font.mono,
          marginTop: "4px",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

Card.Desc = function CardDesc({ children, sx, style }: SectionProps) {
  return (
    <Box
      component="p"
      sx={[
        {
          fontSize: "14px",
          lineHeight: 1.55,
          color: auroraPalette.txMid,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textWrap: "pretty",
          margin: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

Card.DataRow = function CardDataRow({ children, sx, style }: SectionProps) {
  return (
    <Box
      sx={[
        { display: "flex", gap: "10px" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

interface DataCellProps extends SectionProps {
  label: ReactNode;
  icon?: ReactNode;
}

Card.DataCell = function CardDataCell({
  label,
  icon,
  children,
  sx,
  style,
}: DataCellProps) {
  return (
    <Box
      sx={[
        {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          padding: "11px 13px",
          borderRadius: auroraPalette.radii.sm,
          background: "oklch(0.27 0.022 262 / 0.42)",
          border: `1px solid ${auroraPalette.line}`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      <Box
        component="span"
        sx={{
          fontSize: "10.5px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: auroraPalette.txLow,
          fontWeight: 600,
        }}
      >
        {label}
      </Box>
      <Box
        component="span"
        sx={{
          fontFamily: auroraPalette.font.mono,
          fontSize: "15px",
          fontWeight: 600,
          color: auroraPalette.txHi,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          "& svg": { color: auroraPalette.txMid },
        }}
      >
        {icon}
        {children}
      </Box>
    </Box>
  );
};

Card.Foot = function CardFoot({ children, sx, style }: SectionProps) {
  return (
    <Box
      sx={[
        {
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "14px 18px 14px 22px",
          borderTop: `1px solid ${auroraPalette.line}`,
          background: "oklch(0.16 0.024 262 / 0.5)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

Card.FootLeft = function CardFootLeft({ children, sx, style }: SectionProps) {
  return (
    <Box
      sx={[
        { display: "flex", alignItems: "center", gap: "12px", minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

Card.FootDate = function CardFootDate({ children, sx, style }: SectionProps) {
  return (
    <Box
      component="span"
      sx={[
        {
          fontFamily: auroraPalette.font.mono,
          fontSize: "12px",
          color: auroraPalette.txLow,
          whiteSpace: "nowrap",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

Card.Actions = function CardActions({ children, sx, style }: SectionProps) {
  return (
    <Box
      sx={[
        { display: "flex", alignItems: "center", gap: "4px" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {children}
    </Box>
  );
};

interface FailNoteProps extends SectionProps {
  icon?: ReactNode;
}

Card.FailNote = function CardFailNote({
  children,
  icon,
  sx,
  style,
}: FailNoteProps) {
  return (
    <Box
      sx={[
        {
          display: "flex",
          alignItems: "center",
          gap: "9px",
          padding: "11px 13px",
          borderRadius: auroraPalette.radii.sm,
          background: "oklch(0.74 0.145 18 / 0.1)",
          border: "1px solid oklch(0.74 0.145 18 / 0.3)",
          color: auroraPalette.status.fail,
          fontSize: "13px",
          fontWeight: 500,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
    >
      {icon}
      {children}
    </Box>
  );
};
