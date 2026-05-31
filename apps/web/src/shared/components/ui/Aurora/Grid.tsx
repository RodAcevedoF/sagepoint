"use client";

import { Box } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";

interface GridProps {
  children: ReactNode;
  /** Desktop column count. Mobile breakpoints adapt automatically. */
  cols?: 2 | 3;
  style?: CSSProperties;
}

const GAP = 20;

export function Grid({ children, cols = 3, style }: GridProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: `${GAP}px`,
        justifyContent: "flex-start",
        alignItems: "stretch",
        "& > *": {
          flex: `0 1 calc((100% - ${(cols - 1) * GAP}px) / ${cols})`,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        },
        "@media (max-width: 900px)": {
          "& > *": {
            flex: `0 1 calc((100% - ${GAP}px) / 2)`,
          },
        },
        "@media (max-width: 640px)": {
          "& > *": { flex: "0 1 100%" },
        },
      }}
      style={style}
    >
      {children}
    </Box>
  );
}
