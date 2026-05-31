"use client";

import { Box } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { Button } from "../Button/Button";
import {
  ButtonIconPositions,
  ButtonSizes,
  ButtonVariants,
} from "@/shared/types";

interface HeroCta {
  label: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
}

interface HeroProps {
  eyebrow: ReactNode;
  eyebrowIcon?: ReactNode;
  title: ReactNode;
  lede: ReactNode;
  cta?: HeroCta;
  glyph?: ReactNode;
  style?: CSSProperties;
}

export function Hero({
  eyebrow,
  eyebrowIcon,
  title,
  lede,
  cta,
  glyph,
  style,
}: HeroProps) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "26px",
        border: `1px solid ${auroraPalette.line}`,
        background:
          "radial-gradient(620px 360px at 88% 16%, oklch(0.45 0.10 195 / 0.16), transparent 70%), linear-gradient(160deg, oklch(0.24 0.03 250 / 0.7), oklch(0.17 0.03 264 / 0.6))",
        boxShadow: auroraPalette.shadow.card,
        padding: "52px 56px 56px",
        "@media (max-width: 640px)": {
          padding: "28px 22px 30px",
          borderRadius: "20px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        },
      }}
      style={style}
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "9px",
          whiteSpace: "nowrap",
          padding: "8px 15px",
          borderRadius: auroraPalette.radii.pill,
          background: auroraTint(auroraPalette.teal, 0.1),
          border: `1px solid ${auroraTint(auroraPalette.teal, 0.3)}`,
          color: auroraPalette.teal,
          fontFamily: auroraPalette.font.mono,
          fontSize: "11.5px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          "@media (max-width: 640px)": {
            fontSize: "10.5px",
            padding: "6px 12px",
            letterSpacing: "0.1em",
            whiteSpace: "normal",
            textAlign: "center",
          },
        }}
      >
        {eyebrowIcon}
        {eyebrow}
      </Box>
      <Box
        component="h1"
        sx={{
          fontFamily: auroraPalette.font.display,
          fontWeight: 800,
          fontSize: "clamp(44px, 5vw, 72px)",
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
          margin: "22px 0 0",
          maxWidth: "16ch",
          background: `linear-gradient(150deg, ${auroraPalette.txHi} 18%, ${auroraPalette.teal} 92%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          "@media (max-width: 640px)": {
            fontSize: "clamp(30px, 9vw, 40px)",
            margin: "16px 0 0",
            maxWidth: "100%",
          },
        }}
      >
        {title}
      </Box>
      <Box
        component="p"
        sx={{
          margin: "22px 0 0",
          maxWidth: "52ch",
          fontSize: "17.5px",
          lineHeight: 1.62,
          color: auroraPalette.txMid,
          textWrap: "pretty",
          "@media (max-width: 640px)": {
            margin: "14px auto 0",
            fontSize: "15px",
            textAlign: "center",
          },
        }}
      >
        {lede}
      </Box>
      {cta && (
        <Box sx={{ marginTop: "34px" }}>
          <Button
            label={cta.label}
            icon={cta.icon}
            iconPos={ButtonIconPositions.START}
            variant={ButtonVariants.AURORA}
            size={ButtonSizes.LARGE}
            onClick={cta.onClick}
            href={cta.href}
          />
        </Box>
      )}
      {glyph && (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            right: "54px",
            top: "50%",
            transform: "translateY(-50%)",
            color: auroraTint(auroraPalette.teal, 0.16),
            pointerEvents: "none",
            "@media (max-width: 640px)": { display: "none" },
          }}
        >
          {glyph}
        </Box>
      )}
    </Box>
  );
}
