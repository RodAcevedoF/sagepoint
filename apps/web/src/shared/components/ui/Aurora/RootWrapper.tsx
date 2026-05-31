"use client";

import { Box } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";
import { aurora as auroraPalette } from "@/shared/theme";

interface RootWrapperProps {
  children: ReactNode;
  paddingTop?: number;
  paddingBottom?: number;
  style?: CSSProperties;
}

/**
 * Aurora page wrapper — radial-gradient bg + max-width gutter. Drop around any
 * route that should live on the Aurora canvas.
 */
export function RootWrapper({
  children,
  paddingTop = 16,
  paddingBottom = 64,
  style,
}: RootWrapperProps) {
  return (
    <Box
      sx={{
        fontFamily: auroraPalette.font.ui,
        color: auroraPalette.tx,
        background: `radial-gradient(1100px 620px at 18% -8%, oklch(0.40 0.10 200 / 0.30), transparent 60%), radial-gradient(900px 600px at 92% 4%, oklch(0.34 0.10 268 / 0.34), transparent 58%), linear-gradient(180deg, ${auroraPalette.bg1}, ${auroraPalette.bg0} 60%)`,
        WebkitFontSmoothing: "antialiased",
        textRendering: "optimizeLegibility",
      }}
      style={{ paddingTop, paddingBottom, ...style }}
    >
      <Box
        sx={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "0 40px",
          "@media (max-width: 640px)": { padding: "0 18px" },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
