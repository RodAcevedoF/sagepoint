"use client";

import { Box } from "@mui/material";
import { Network, Eye, Bot } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { aurora as auroraPalette } from "@/shared/theme";
import {
  toneColor,
  type AuroraTone,
} from "@/shared/components/ui/Aurora/tones";

interface TechItem {
  label: string;
  icon: LucideIcon;
  tone: AuroraTone;
}

const TECH_ITEMS: TechItem[] = [
  { label: "Knowledge Graph", icon: Network, tone: "teal" },
  { label: "Vision Intel", icon: Eye, tone: "concept" },
  { label: "LLM Agent", icon: Bot, tone: "enrich" },
];

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
    mt: "22px",
  },
  chipBase: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 13px",
    borderRadius: "10px",
    fontSize: "12.5px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    color: auroraPalette.tx,
    background: auroraPalette.surface2,
    border: `1px solid ${auroraPalette.line}`,
  },
} as const;

export function TechStack() {
  return (
    <Box sx={styles.container}>
      {TECH_ITEMS.map(({ label, icon: Icon, tone }) => (
        <Box key={label} sx={styles.chipBase}>
          <Icon size={14} color={toneColor(tone)} />
          {label}
        </Box>
      ))}
    </Box>
  );
}
