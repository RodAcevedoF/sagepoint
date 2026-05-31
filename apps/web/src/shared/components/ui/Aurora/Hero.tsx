"use client";

import { Box } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
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

interface HeroBackLink {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface HeroStat {
  value: ReactNode;
  label: ReactNode;
  dotColor?: string;
}

interface HeroProps {
  eyebrow: ReactNode;
  eyebrowIcon?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  cta?: HeroCta;
  glyph?: ReactNode;
  backLink?: HeroBackLink;
  stats?: ReadonlyArray<HeroStat>;
  style?: CSSProperties;
}

function HeroBackChip({ backLink }: { backLink: HeroBackLink }) {
  const router = useRouter();
  const handle = () => {
    if (backLink.onClick) {
      backLink.onClick();
      return;
    }
    if (backLink.href) router.push(backLink.href);
  };
  return (
    <Box
      component="span"
      onClick={handle}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        alignSelf: "flex-start",
        whiteSpace: "nowrap",
        padding: "8px 14px",
        borderRadius: auroraPalette.radii.md,
        cursor: "pointer",
        background: auroraTint(auroraPalette.teal, 0.08),
        border: `1px solid ${auroraTint(auroraPalette.teal, 0.3)}`,
        color: auroraPalette.teal,
        fontWeight: 600,
        fontSize: "13.5px",
        transition: "background .15s, transform .15s",
        marginBottom: "16px",
        "&:hover": {
          background: auroraTint(auroraPalette.teal, 0.16),
          transform: "translateX(-2px)",
        },
      }}
    >
      <ArrowLeft size={16} />
      {backLink.label}
    </Box>
  );
}

export function Hero({
  eyebrow,
  eyebrowIcon,
  title,
  lede,
  cta,
  glyph,
  backLink,
  stats,
  style,
}: HeroProps) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "22px",
        border: `1px solid ${auroraPalette.line}`,
        background:
          "radial-gradient(560px 320px at 90% 12%, oklch(0.45 0.10 195 / 0.14), transparent 70%), linear-gradient(160deg, oklch(0.24 0.03 250 / 0.7), oklch(0.17 0.03 264 / 0.6))",
        boxShadow: auroraPalette.shadow.card,
        padding: "36px 56px 38px",
        display: "flex",
        flexDirection: "column",
        marginBottom: "28px",
        "@media (max-width: 640px)": {
          padding: "24px 22px 26px",
          borderRadius: "18px",
          alignItems: "stretch",
        },
      }}
      style={style}
    >
      {backLink && <HeroBackChip backLink={backLink} />}

      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "9px",
          alignSelf: "flex-start",
          whiteSpace: "nowrap",
          padding: "7px 14px",
          borderRadius: auroraPalette.radii.pill,
          background: auroraTint(auroraPalette.teal, 0.1),
          border: `1px solid ${auroraTint(auroraPalette.teal, 0.3)}`,
          color: auroraPalette.teal,
          fontFamily: auroraPalette.font.mono,
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          "@media (max-width: 640px)": {
            fontSize: "10.5px",
            padding: "6px 12px",
            letterSpacing: "0.1em",
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
          fontSize: "clamp(34px, 4vw, 52px)",
          lineHeight: 1.02,
          letterSpacing: "-0.025em",
          margin: "16px 0 0",
          maxWidth: "18ch",
          background: `linear-gradient(150deg, ${auroraPalette.txHi} 18%, ${auroraPalette.teal} 92%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          "@media (max-width: 640px)": {
            fontSize: "clamp(28px, 8vw, 36px)",
            margin: "12px 0 0",
            maxWidth: "100%",
          },
        }}
      >
        {title}
      </Box>

      {lede && (
        <Box
          component="p"
          sx={{
            margin: "14px 0 0",
            maxWidth: "56ch",
            fontSize: "16px",
            lineHeight: 1.55,
            color: auroraPalette.txMid,
            textWrap: "pretty",
            "@media (max-width: 640px)": {
              margin: "12px 0 0",
              fontSize: "14.5px",
            },
          }}
        >
          {lede}
        </Box>
      )}

      {stats && stats.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "22px",
            marginTop: "20px",
          }}
        >
          {stats.map((stat, i) => (
            <Box
              key={i}
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                fontSize: "13.5px",
                color: auroraPalette.tx,
                "&::before": stat.dotColor
                  ? {
                      content: '""',
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: stat.dotColor,
                    }
                  : undefined,
              }}
            >
              <Box
                component="b"
                sx={{
                  fontFamily: auroraPalette.font.mono,
                  color: auroraPalette.txHi,
                  fontWeight: 600,
                }}
              >
                {stat.value}
              </Box>
              {stat.label}
            </Box>
          ))}
        </Box>
      )}

      {cta && (
        <Box sx={{ marginTop: "26px", alignSelf: "flex-start" }}>
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
            right: "42px",
            top: "50%",
            transform: "translateY(-50%)",
            color: auroraTint(auroraPalette.teal, 0.16),
            pointerEvents: "none",
            "@media (max-width: 900px)": { display: "none" },
          }}
        >
          {glyph}
        </Box>
      )}
    </Box>
  );
}
