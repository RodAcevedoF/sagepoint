"use client";

import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";
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

const TONES: Record<MilestoneTone, string> = {
  primary: aurora.status.ready,
  secondary: aurora.status.enrich,
  warning: aurora.status.proc,
};

function MilestonesVisual() {
  return (
    <SlideVisualFrame label="BUILD STEPS" accent={aurora.status.proc}>
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
            <stop offset="0%" stopColor={auroraTint(TONES.primary, 0.45)} />
            <stop offset="55%" stopColor={auroraTint(TONES.secondary, 0.45)} />
            <stop offset="100%" stopColor={auroraTint(TONES.warning, 0.45)} />
          </linearGradient>
          <linearGradient
            id="milestone-path"
            x1="48"
            y1="164"
            x2="292"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={TONES.primary} />
            <stop offset="55%" stopColor={TONES.secondary} />
            <stop offset="100%" stopColor={TONES.warning} />
          </linearGradient>
        </defs>

        <path
          d="M 26 196 C 102 206 154 162 214 126 C 254 102 286 84 322 44"
          fill="none"
          stroke={auroraTint(aurora.teal, 0.08)}
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
          stroke={auroraTint(aurora.txHi, 0.12)}
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
          const color = TONES[item.color];
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
                fill={auroraTint(color, 0.12)}
              />
              <circle
                cx={item.x}
                cy={item.y}
                r="20"
                fill={auroraTint(color, 0.18)}
              />
              <circle
                cx={item.x}
                cy={item.y}
                r="8"
                fill={color}
                stroke={auroraTint(aurora.txHi, 0.7)}
                strokeWidth="2"
              />
              <text
                x={item.x}
                y={item.y + 3}
                textAnchor="middle"
                fontSize="7"
                fontWeight="700"
                fill={aurora.tealInk}
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
                fill={auroraTint(aurora.txHi, 0.94)}
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
                stroke={auroraTint(color, 0.44)}
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
  return (
    <SlideShell
      eyebrow="Learn by building"
      title="Turn theory into momentum"
      body="Small builds mark the jumps that matter."
      visual={<MilestonesVisual />}
      accent={aurora.status.proc}
      reversed={reversed}
    />
  );
}
