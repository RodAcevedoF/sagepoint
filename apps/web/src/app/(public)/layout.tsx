"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
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
  return (
    <PublicLayout>
      <Antigravity
        count={380}
        magnetRadius={10}
        lerpSpeed={0.08}
        color={palette.primary.light}
        fieldStrength={12}
        particleSize={1.5}
      />
      <Box sx={styles.content}>{children}</Box>
    </PublicLayout>
  );
}
