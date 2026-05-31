"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { PublicLayout } from "@/shared/components";
import { palette } from "@/shared/theme";

const Antigravity = dynamic(
  () =>
    import("@/shared/components/ui/animations/Antigravity").then(
      (m) => m.Antigravity,
    ),
  { ssr: false },
);

const styles = {
  content: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
};

export default function PublicRoutesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <PublicLayout>
      <Antigravity
        count={isMobile ? 140 : 380}
        magnetRadius={10}
        lerpSpeed={0.08}
        color={palette.primary.light}
        fieldStrength={isMobile ? 8 : 12}
        particleSize={isMobile ? 1.2 : 1.5}
        containerStyle={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
        }}
      />
      <Box sx={styles.content}>{children}</Box>
    </PublicLayout>
  );
}
