"use client";

import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { aurora, auroraTint } from "@/shared/theme";

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
  const accentColor = accent ?? aurora.teal;

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
          background: `radial-gradient(circle at 18% 20%, ${auroraTint(accentColor, 0.18)} 0%, transparent 34%), radial-gradient(circle at 86% 78%, ${auroraTint(aurora.txHi, 0.08)} 0%, transparent 28%)`,
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
          stroke={auroraTint(accentColor, 0.16)}
          strokeWidth="48"
          strokeLinecap="round"
        />
        <path
          d="M 70 44 L 70 262 L 492 262"
          fill="none"
          stroke={auroraTint(aurora.txHi, 0.12)}
          strokeWidth="1"
        />
        <path
          d="M 90 80 C 166 22 278 26 366 92 C 432 142 462 176 494 228"
          fill="none"
          stroke={auroraTint(aurora.txHi, 0.1)}
          strokeWidth="1.2"
          strokeDasharray="3 12"
        />
        <path
          d="M 52 220 C 150 218 212 148 292 138 C 386 126 434 172 500 162"
          fill="none"
          stroke={auroraTint(aurora.txHi, 0.08)}
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
            backgroundColor: auroraTint(accentColor, 0.8),
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: aurora.txMid,
            fontFamily: aurora.font.mono,
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
  const accentColor = accent ?? aurora.teal;

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
              backgroundColor: auroraTint(accentColor, 0.8),
            }}
          />
          <Typography
            variant="caption"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.24em",
              fontWeight: 700,
              color: accentColor,
              fontFamily: aurora.font.mono,
              fontSize: { xs: "0.62rem", md: "0.72rem" },
            }}
          >
            {eyebrow}
          </Typography>
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontFamily: aurora.font.display,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            fontSize: { xs: "1.16rem", sm: "1.52rem", md: "1.82rem" },
            color: aurora.txHi,
            maxWidth: 460,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: aurora.txMid,
            fontFamily: aurora.font.ui,
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
