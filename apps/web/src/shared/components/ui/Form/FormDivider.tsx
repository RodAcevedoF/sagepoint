"use client";

import { Divider } from "@mui/material";
import { aurora } from "@/shared/theme";
import type { FormDividerProps } from "./Form.types";

export function FormDivider({ children = "or" }: FormDividerProps) {
  return (
    <Divider
      sx={{
        my: 3,
        color: aurora.txLow,
        fontFamily: aurora.font.mono,
        fontSize: "11px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        "&::before, &::after": {
          borderColor: aurora.line,
        },
      }}
    >
      {children}
    </Divider>
  );
}
