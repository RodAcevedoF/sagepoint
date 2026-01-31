"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { darkTheme } from "@/common/theme";
import type { ReactNode } from "react";

interface PublicThemeProviderProps {
  children: ReactNode;
}

/**
 * PublicThemeProvider ensures that the dark theme and its global resets (CssBaseline)
 * are applied to all public-facing pages, even if the root layout uses a different default.
 */
export function PublicThemeProvider({ children }: PublicThemeProviderProps) {
  return (
    <ThemeProvider theme={darkTheme}>
      {/*
        CssBaseline is critical here to override any global light-mode styles
        from globals.css and apply the theme's dark background color to the body.
      */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
