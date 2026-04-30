"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import type { ReactNode } from "react";

const COPY_BLOCK_MIN_HEIGHT = {
  xs: 92,
  sm: 112,
  md: 132,
};

const VISUAL_SLOT_MIN_HEIGHT = {
  xs: 272,
  sm: 300,
  md: 320,
};

interface Props {
  eyebrow: string;
  title: string;
  body: string;
  visual: ReactNode;
  accent?: string;
  reversed?: boolean;
}

interface SlideVisualFrameProps {
  label: string;
  children: ReactNode;
  accent?: string;
  maxWidth?: number;
  minHeight?: number;
}

export function SlideVisualFrame({
  label,
  children,
  accent,
  maxWidth = 460,
  minHeight = 280,
}: SlideVisualFrameProps) {
  const theme = useTheme();
  const accentColor = accent ?? theme.palette.primary.light;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth,
        minHeight: { xs: Math.max(240, minHeight - 28), md: minHeight },
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 0.5, md: 1.5 },
        py: { xs: 2.5, md: 3.5 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "28px",
          background: `radial-gradient(circle at 18% 20%, ${alpha(accentColor, 0.18)} 0%, transparent 34%), radial-gradient(circle at 86% 78%, ${alpha(theme.palette.common.white, 0.08)} 0%, transparent 28%)`,
          opacity: 0.95,
        }}
      />

      <Box
        component="svg"
        viewBox="0 0 520 300"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <path
          d="M 30 244 C 124 286 210 272 304 208 C 372 162 430 134 496 128"
          fill="none"
          stroke={alpha(accentColor, 0.16)}
          strokeWidth="48"
          strokeLinecap="round"
        />
        <path
          d="M 70 44 L 70 262 L 492 262"
          fill="none"
          stroke={alpha(theme.palette.common.white, 0.12)}
          strokeWidth="1"
        />
        <path
          d="M 90 80 C 166 22 278 26 366 92 C 432 142 462 176 494 228"
          fill="none"
          stroke={alpha(theme.palette.common.white, 0.1)}
          strokeWidth="1.2"
          strokeDasharray="3 12"
        />
        <path
          d="M 52 220 C 150 218 212 148 292 138 C 386 126 434 172 500 162"
          fill="none"
          stroke={alpha(theme.palette.common.white, 0.08)}
          strokeWidth="1"
          strokeDasharray="8 10"
        />
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: { xs: 12, md: 16 },
          left: { xs: 10, md: 16 },
          display: "flex",
          alignItems: "center",
          gap: 1,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 1,
            borderRadius: 999,
            backgroundColor: alpha(accentColor, 0.8),
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: alpha(theme.palette.text.secondary, 0.76),
            letterSpacing: "0.22em",
            fontWeight: 700,
            fontSize: { xs: "0.62rem", md: "0.72rem" },
          }}
        >
          {label}
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "flex-start",
          pt: { xs: 1.25, md: 1.5 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function SlideShell({
  eyebrow,
  title,
  body,
  visual,
  accent,
  reversed = false,
}: Props) {
  const theme = useTheme();
  const accentColor = accent ?? theme.palette.primary.light;

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: reversed ? "column-reverse" : "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: { xs: 1.25, md: 1.75 },
        px: { xs: 0.5, sm: 2, md: 3 },
        py: { xs: 1, md: 2 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 500,
          minHeight: COPY_BLOCK_MIN_HEIGHT,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 0.75,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            mb: 0.25,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 1,
              borderRadius: 999,
              backgroundColor: alpha(accentColor, 0.8),
            }}
          />
          <Typography
            variant="caption"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.24em",
              fontWeight: 700,
              color: accentColor,
              fontSize: { xs: "0.62rem", md: "0.72rem" },
            }}
          >
            {eyebrow}
          </Typography>
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            fontSize: { xs: "1.16rem", sm: "1.52rem", md: "1.82rem" },
            color: theme.palette.text.primary,
            maxWidth: 460,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.65,
            maxWidth: 440,
            fontSize: { xs: "0.84rem", md: "0.98rem" },
          }}
        >
          {body}
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          minHeight: VISUAL_SLOT_MIN_HEIGHT,
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          flex: "1 0 auto",
          pt: { xs: 0.25, md: 0.5 },
        }}
      >
        {visual}
      </Box>
    </Box>
  );
}
