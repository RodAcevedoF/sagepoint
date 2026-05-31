"use client";

import { Box, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { aurora } from "@/shared/theme";
import type { FormLinkProps } from "./Form.types";

export function FormLink({ href, children }: FormLinkProps) {
  return (
    <Box display="flex" justifyContent="center">
      <MuiLink
        component={Link}
        href={href}
        underline="hover"
        sx={{
          color: aurora.teal,
          fontFamily: aurora.font.ui,
          fontWeight: 600,
          fontSize: "14px",
          textDecorationColor: "transparent",
          transition: "color .2s ease, text-decoration-color .2s ease",
          "&:hover": {
            color: aurora.txHi,
            textDecorationColor: aurora.teal,
          },
        }}
      >
        {children}
      </MuiLink>
    </Box>
  );
}
