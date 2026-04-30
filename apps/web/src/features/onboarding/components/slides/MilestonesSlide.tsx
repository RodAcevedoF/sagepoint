"use client";

import { Box, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { SlideShell, SlideVisualFrame } from "./SlideShell";

type MilestoneTone = "primary" | "secondary" | "warning";

interface Milestone {
  label: string;
  color: MilestoneTone;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  textAnchor: "start" | "middle" | "end";
  lineWidth: number;
}

const MILESTONES: Milestone[] = [
  {
    label: "API call",
    color: "primary",
    x: 48,
    y: 164,
    labelX: 84,
    labelY: 146,
    textAnchor: "start",
    lineWidth: 58,
  },
  {
    label: "First build",
    color: "secondary",
    x: 172,
    y: 112,
    labelX: 172,
    labelY: 72,
    textAnchor: "middle",
    lineWidth: 64,
  },
  {
    label: "Demo ready",
    color: "warning",
    x: 292,
    y: 60,
    labelX: 258,
    labelY: 124,
    textAnchor: "end",
    lineWidth: 70,
  },
];

function MilestonesVisual() {
  const theme = useTheme();
  const tones = {
    primary: theme.palette.primary.light,
    secondary: theme.palette.secondary.light,
    warning: theme.palette.warning.light,
  };

  return (
    <SlideVisualFrame label="BUILD STEPS" accent={theme.palette.warning.light}>
      <Box
        component="svg"
        viewBox="0 0 340 240"
        sx={{
          width: "100%",
          maxWidth: 380,
          height: "auto",
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient
            id="milestone-path-base"
            x1="48"
            y1="164"
            x2="292"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={alpha(tones.primary, 0.45)} />
            <stop offset="55%" stopColor={alpha(tones.secondary, 0.45)} />
            <stop offset="100%" stopColor={alpha(tones.warning, 0.45)} />
          </linearGradient>
          <linearGradient
            id="milestone-path"
            x1="48"
            y1="164"
            x2="292"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={tones.primary} />
            <stop offset="55%" stopColor={tones.secondary} />
            <stop offset="100%" stopColor={tones.warning} />
          </linearGradient>
        </defs>

        <path
          d="M 26 196 C 102 206 154 162 214 126 C 254 102 286 84 322 44"
          fill="none"
          stroke={alpha(theme.palette.primary.light, 0.08)}
          strokeWidth="44"
          strokeLinecap="round"
        />

        <motion.path
          d="M 48 164 C 106 170 134 140 172 112 C 214 84 246 72 292 60"
          fill="none"
          stroke="url(#milestone-path-base)"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 0.42 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        <motion.path
          d="M 52 172 C 112 176 150 144 194 106 C 228 78 260 64 300 56"
          fill="none"
          stroke={alpha(theme.palette.common.white, 0.12)}
          strokeWidth="1.2"
          strokeDasharray="4 10"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 1.25, delay: 0.2, ease: "easeOut" }}
        />

        <motion.path
          d="M 48 164 C 106 170 134 140 172 112 C 214 84 246 72 292 60"
          fill="none"
          stroke="url(#milestone-path)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 0.55 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {MILESTONES.map((item, index) => {
          const color = tones[item.color];
          return (
            <motion.g
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 + index * 0.16 }}
            >
              <circle
                cx={item.x}
                cy={item.y}
                r="26"
                fill={alpha(color, 0.12)}
              />
              <circle
                cx={item.x}
                cy={item.y}
                r="20"
                fill={alpha(color, 0.18)}
              />
              <circle
                cx={item.x}
                cy={item.y}
                r="8"
                fill={color}
                stroke={alpha("#fff", 0.7)}
                strokeWidth="2"
              />
              <text
                x={item.x}
                y={item.y + 3}
                textAnchor="middle"
                fontSize="7"
                fontWeight="700"
                fill={theme.palette.background.default}
              >
                {String(index + 1).padStart(2, "0")}
              </text>
              <text
                x={item.labelX}
                y={item.labelY}
                textAnchor={item.textAnchor}
                fontSize="12"
                fontWeight="700"
                letterSpacing="0.02em"
                fill={alpha(theme.palette.text.primary, 0.94)}
              >
                {item.label}
              </text>
              <line
                x1={
                  item.textAnchor === "start"
                    ? item.labelX
                    : item.labelX - item.lineWidth
                }
                y1={item.labelY + 10}
                x2={
                  item.textAnchor === "end"
                    ? item.labelX
                    : item.labelX + item.lineWidth
                }
                y2={item.labelY + 10}
                stroke={alpha(color, 0.44)}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </motion.g>
          );
        })}
      </Box>
    </SlideVisualFrame>
  );
}

export function MilestonesSlide({ reversed }: { reversed?: boolean }) {
  const theme = useTheme();
  return (
    <SlideShell
      eyebrow="Learn by building"
      title="Turn theory into momentum"
      body="Small builds mark the jumps that matter."
      visual={<MilestonesVisual />}
      accent={theme.palette.warning.light}
      reversed={reversed}
    />
  );
}
