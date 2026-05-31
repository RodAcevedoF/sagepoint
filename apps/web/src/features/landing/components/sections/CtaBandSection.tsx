"use client";

import { Box, Container, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { Rocket, LogIn } from "lucide-react";
import { Button } from "@/shared/components";
import { ButtonVariants, ButtonSizes } from "@/shared/types";
import { aurora as auroraPalette } from "@/shared/theme";

const styles = {
  root: {
    pb: { xs: 6, md: 8 },
    pt: { xs: 2, md: 4 },
  },
  band: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "28px",
    border: `1px solid ${auroraPalette.line2}`,
    padding: { xs: "44px 28px", md: "64px 56px" },
    textAlign: "center",
    background:
      "radial-gradient(600px 280px at 50% 0%, oklch(0.42 0.10 195 / 0.18), transparent 70%), linear-gradient(160deg, oklch(0.24 0.03 250 / 0.8), oklch(0.16 0.03 264 / 0.7))",
    boxShadow: auroraPalette.shadow.card,
  },
  title: {
    fontFamily: auroraPalette.font.display,
    fontWeight: 800,
    fontSize: { xs: "2rem", md: "3rem" },
    letterSpacing: "-0.03em",
    margin: 0,
    color: auroraPalette.txHi,
  },
  lede: {
    margin: "16px auto 0",
    maxWidth: "48ch",
    fontSize: "17px",
    color: auroraPalette.txMid,
    lineHeight: 1.6,
  },
  actions: {
    mt: 4,
  },
} as const;

export function CtaBandSection() {
  const router = useRouter();

  return (
    <Box component="section" sx={styles.root}>
      <Container maxWidth="lg">
        <Box sx={styles.band}>
          <Box component="h2" sx={styles.title}>
            Turn your documents into mastery.
          </Box>
          <Box component="p" sx={styles.lede}>
            Upload a PDF and watch SagePoint build your personalized roadmap in
            seconds.
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={styles.actions}
          >
            <Button
              label="Get Started Free"
              variant={ButtonVariants.AURORA}
              size={ButtonSizes.LARGE}
              icon={Rocket}
              onClick={() => router.push("/register")}
            />
            <Button
              label="Sign In"
              variant={ButtonVariants.AURORA_GHOST}
              size={ButtonSizes.LARGE}
              icon={LogIn}
              onClick={() => router.push("/login")}
            />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
