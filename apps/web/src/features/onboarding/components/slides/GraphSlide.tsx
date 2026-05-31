"use client";

import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";
import { SlideShell, SlideVisualFrame } from "./SlideShell";

type GraphTone =
  | "primary"
  | "purple"
  | "accent"
  | "secondary"
  | "warning"
  | "success";

interface GraphNode {
  x: number;
  y: number;
  label: string;
  size: number;
  tone: GraphTone;
  labelWidth: number;
}

const NODES: GraphNode[] = [
  {
    x: 60,
    y: 92,
    label: "Foundations",
    size: 22,
    tone: "primary",
    labelWidth: 96,
  },
  {
    x: 186,
    y: 38,
    label: "Variables",
    size: 18,
    tone: "purple",
    labelWidth: 82,
  },
  {
    x: 210,
    y: 156,
    label: "Functions",
    size: 18,
    tone: "accent",
    labelWidth: 84,
  },
  {
    x: 322,
    y: 88,
    label: "Async",
    size: 18,
    tone: "secondary",
    labelWidth: 66,
  },
  { x: 344, y: 214, label: "APIs", size: 18, tone: "warning", labelWidth: 58 },
  {
    x: 462,
    y: 146,
    label: "Project",
    size: 22,
    tone: "success",
    labelWidth: 74,
  },
];

const EDGES: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 5],
];

const TONES: Record<GraphTone, string> = {
  primary: aurora.teal,
  purple: aurora.status.enrich,
  accent: aurora.status.concept,
  secondary: aurora.tealDeep,
  warning: aurora.status.proc,
  success: aurora.status.ready,
};

function GraphVisual() {
  const accent = aurora.status.enrich;
  const labelColor = auroraTint(aurora.txHi, 0.92);

  return (
    <SlideVisualFrame label="LEARNING MAP" accent={accent} maxWidth={460}>
      <Box
        component="svg"
        viewBox="0 0 540 280"
        sx={{
          width: "100%",
          maxWidth: 430,
          height: "auto",
          overflow: "visible",
          display: "block",
        }}
      >
        <defs>
          <filter id="soft-blur">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          {Object.entries(TONES).map(([tone, color]) => (
            <radialGradient
              key={tone}
              id={`nodeGlow-${tone}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>

        <path
          d="M 32 206 C 118 238 196 230 286 176 C 348 138 416 110 502 104"
          fill="none"
          stroke={auroraTint(aurora.teal, 0.18)}
          strokeWidth="54"
          strokeLinecap="round"
          filter="url(#soft-blur)"
          opacity="0.95"
        />
        <path
          d="M 42 78 C 126 22 248 28 348 88 C 412 126 456 170 500 226"
          fill="none"
          stroke={auroraTint(aurora.txHi, 0.08)}
          strokeWidth="1.25"
          strokeDasharray="2 12"
        />
        <path
          d="M 44 226 C 158 214 210 132 288 120 C 380 106 434 164 504 154"
          fill="none"
          stroke={auroraTint(aurora.txHi, 0.07)}
          strokeWidth="1"
          strokeDasharray="6 10"
        />
        {EDGES.map(([a, b], i) => {
          const A = NODES[a];
          const B = NODES[b];
          const startColor = TONES[A.tone];
          const endColor = TONES[B.tone];
          const mx = (A.x + B.x) / 2;
          const my = (A.y + B.y) / 2 - 18;
          return (
            <motion.path
              key={i}
              d={`M ${A.x} ${A.y} Q ${mx} ${my} ${B.x} ${B.y}`}
              stroke={`url(#edge-${i})`}
              strokeWidth={2.35}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.92 }}
              transition={{
                duration: 0.55,
                delay: 0.5 + i * 0.16,
                ease: "easeOut",
              }}
            >
              <linearGradient
                id={`edge-${i}`}
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={auroraTint(startColor, 0.5)} />
                <stop offset="100%" stopColor={auroraTint(endColor, 0.72)} />
              </linearGradient>
            </motion.path>
          );
        })}

        {NODES.map((n, i) => {
          const color = TONES[n.tone];
          return (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.45,
                delay: i * 0.14,
                ease: [0.22, 1.4, 0.36, 1],
              }}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={n.size + 18}
                fill={auroraTint(color, 0.08)}
                filter="url(#soft-blur)"
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.size + 12}
                fill={`url(#nodeGlow-${n.tone})`}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.size + 4}
                fill="none"
                stroke={auroraTint(color, 0.28)}
                strokeWidth={1.5}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.size}
                fill={auroraTint(color, 0.16)}
                stroke={color}
                strokeWidth={1.75}
              />
              <circle cx={n.x} cy={n.y} r={n.size / 3.2} fill={color} />
              <text
                x={n.x}
                y={n.y + n.size + 18}
                textAnchor="middle"
                fill={labelColor}
                fontSize="11"
                fontWeight={600}
                letterSpacing="0.02em"
              >
                {n.label}
              </text>
              <line
                x1={n.x - n.labelWidth / 2 + 8}
                y1={n.y + n.size + 26}
                x2={n.x + n.labelWidth / 2 - 8}
                y2={n.y + n.size + 26}
                stroke={auroraTint(color, 0.42)}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </motion.g>
          );
        })}

        {NODES.map((n, i) => (
          <circle
            key={`anchor-${i}`}
            cx={n.x}
            cy={n.y}
            r="1.8"
            fill={auroraTint(aurora.txHi, 0.95)}
            opacity="0.8"
          />
        ))}

        <motion.circle
          r={4}
          fill={accent}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2,
            delay: 1.6,
            repeat: Infinity,
            repeatDelay: 0.8,
          }}
        >
          <animateMotion
            dur="2s"
            begin="1.6s"
            repeatCount="indefinite"
            path={`M ${NODES[0].x} ${NODES[0].y} Q 250 60 ${NODES[5].x} ${NODES[5].y}`}
          />
        </motion.circle>
      </Box>
    </SlideVisualFrame>
  );
}

export function GraphSlide({ reversed }: { reversed?: boolean }) {
  return (
    <SlideShell
      eyebrow="See the big picture"
      title="A roadmap you can read at a glance"
      body="Each topic links to the next step, so the path always feels clear."
      visual={<GraphVisual />}
      reversed={reversed}
    />
  );
}
