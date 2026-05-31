"use client";

import { Box } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";
import { aurora as auroraPalette } from "@/shared/theme";

interface SecTitleProps {
  children: ReactNode;
  sub?: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  style?: CSSProperties;
}

export function SecTitle({ children, sub, as = "h2", style }: SecTitleProps) {
  return (
    <Box style={style}>
      <Box
        component={as}
        sx={{
          fontFamily: auroraPalette.font.display,
          fontWeight: 700,
          fontSize: "22px",
          color: auroraPalette.txHi,
          margin: 0,
          letterSpacing: "-0.015em",
        }}
      >
        {children}
      </Box>
      {sub && (
        <Box
          component="p"
          sx={{
            color: auroraPalette.txMid,
            fontSize: "14px",
            margin: "5px 0 0",
          }}
        >
          {sub}
        </Box>
      )}
    </Box>
  );
}
