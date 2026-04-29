"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  body: string;
  visual: ReactNode;
  accent?: string;
}

export function SlideShell({ eyebrow, title, body, visual, accent }: Props) {
  const theme = useTheme();
  const accentColor = accent ?? theme.palette.primary.light;

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: { xs: "stretch", md: "center" },
        justifyContent: "center",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 2.5, md: 4 },
        px: { xs: 0.5, sm: 1, md: 3 },
        pt: { xs: 0.5, md: 0 },
        pb: { xs: 3.5, md: 5 },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "44%" },
          maxWidth: { xs: "100%", md: 280 },
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontWeight: 600,
            color: accentColor,
            mb: 1.5,
          }}
        >
          {eyebrow}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            lineHeight: 1.2,
            mb: 1.25,
            fontSize: { xs: "1.2rem", sm: "1.35rem", md: "1.6rem" },
            color: theme.palette.text.primary,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.55,
            maxWidth: 320,
          }}
        >
          {body}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          width: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: { xs: 180, sm: 210, md: 280 },
          p: { xs: 1.25, md: 0 },
          borderRadius: { xs: 3, md: 0 },
          background: {
            xs: `linear-gradient(180deg, ${alpha(accentColor, 0.12)}, transparent 55%)`,
            md: "transparent",
          },
        }}
      >
        {visual}
      </Box>
    </Box>
  );
}
