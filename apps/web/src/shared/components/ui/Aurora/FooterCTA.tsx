"use client";

import { Box } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { aurora as auroraPalette } from "@/shared/theme";
import { Button } from "../Button/Button";
import {
  ButtonIconPositions,
  ButtonSizes,
  ButtonVariants,
} from "@/shared/types";

interface FooterCTAProps {
  title: ReactNode;
  body: ReactNode;
  action: {
    label: ReactNode;
    icon?: LucideIcon;
    trailingIcon?: LucideIcon;
    href?: string;
    onClick?: () => void;
  };
  style?: CSSProperties;
}

export function FooterCTA({ title, body, action, style }: FooterCTAProps) {
  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
        borderRadius: auroraPalette.radii.card,
        border: `1px solid ${auroraPalette.line}`,
        background:
          "radial-gradient(500px 200px at 100% 0%, oklch(0.42 0.10 195 / 0.14), transparent 70%), linear-gradient(160deg, oklch(0.22 0.03 250 / 0.7), oklch(0.16 0.03 264 / 0.6))",
        padding: "34px 40px",
        boxShadow: auroraPalette.shadow.card,
        "@media (max-width: 640px)": {
          flexDirection: "column",
          alignItems: "stretch",
          textAlign: "center",
          padding: "24px 22px",
          gap: "18px",
        },
      }}
      style={style}
    >
      <Box>
        <Box
          component="h3"
          sx={{
            fontFamily: auroraPalette.font.display,
            fontWeight: 700,
            fontSize: "26px",
            color: auroraPalette.txHi,
            margin: 0,
            letterSpacing: "-0.015em",
            "@media (max-width: 640px)": { fontSize: "22px" },
          }}
        >
          {title}
        </Box>
        <Box
          component="p"
          sx={{
            margin: "7px 0 0",
            color: auroraPalette.txMid,
            fontSize: "15px",
            "@media (max-width: 640px)": { fontSize: "14px" },
          }}
        >
          {body}
        </Box>
      </Box>
      <Button
        label={action.label}
        icon={action.icon}
        trailingIcon={action.trailingIcon}
        iconPos={ButtonIconPositions.START}
        variant={ButtonVariants.AURORA_GHOST}
        size={ButtonSizes.LARGE}
        href={action.href}
        onClick={action.onClick}
      />
    </Box>
  );
}
