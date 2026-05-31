"use client";

import { Box, Container } from "@mui/material";
import {
  AutoStories as LearnIcon,
  AccountTree as GraphIcon,
  Psychology as BrainIcon,
  Speed as FastIcon,
  Search as SearchIcon,
  Timeline as ProgressIcon,
} from "@mui/icons-material";
import { ReactNode } from "react";
import { aurora as auroraPalette } from "@/shared/theme";
import {
  resolveAccent,
  type AuroraTone,
} from "@/shared/components/ui/Aurora/tones";

const styles = {
  root: {
    py: { xs: 10, md: 14 },
    position: "relative",
  },
  sectionHeader: {
    textAlign: "center",
    maxWidth: 760,
    mx: "auto",
    mb: 8,
  },
  eyebrow: {
    fontFamily: auroraPalette.font.mono,
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: auroraPalette.teal,
  },
  title: {
    fontFamily: auroraPalette.font.display,
    fontWeight: 800,
    fontSize: { xs: "2.25rem", md: "3.5rem" },
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
    margin: "16px 0 0",
    color: auroraPalette.txHi,
  },
  subtitle: {
    margin: "20px auto 0",
    maxWidth: "54ch",
    fontSize: "17px",
    lineHeight: 1.6,
    color: auroraPalette.txMid,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(3, 1fr)",
    },
    gap: "20px",
  },
} as const;

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  tag: string;
  tone: AuroraTone;
  featured?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: <LearnIcon sx={{ fontSize: 26 }} />,
    title: "Document Normalization",
    description:
      "Upload PDF, DOCX, or XLSX. Our engine extracts text and structure with high precision for AI analysis — no detail is lost.",
    tag: "Multi-format",
    tone: "teal",
  },
  {
    icon: <FastIcon sx={{ fontSize: 26 }} />,
    title: "Instant Roadmaps",
    description:
      "Go from raw documents to structured, sequenced learning paths in seconds, not weeks.",
    tag: "Sequenced",
    tone: "proc",
  },
  {
    icon: <GraphIcon sx={{ fontSize: 26 }} />,
    title: "Knowledge Graphs",
    description:
      "Visualize relationships between concepts with interactive graphs that reveal how ideas connect.",
    tag: "Interactive",
    tone: "concept",
  },
  {
    icon: <BrainIcon sx={{ fontSize: 26 }} />,
    title: "Personalized AI",
    description:
      "The AI adapts to your current expertise and goals, pruning unnecessary topics and surfacing what matters.",
    tag: "Adaptive",
    tone: "enrich",
  },
  {
    icon: <SearchIcon sx={{ fontSize: 26 }} />,
    title: "Smart Discovery",
    description:
      "Automatically find related topics and bridge knowledge gaps you didn't know you had.",
    tag: "Gap-aware",
    tone: "ready",
  },
  {
    icon: <ProgressIcon sx={{ fontSize: 26 }} />,
    title: "Progress Tracking",
    description:
      "Keep track of your learning milestones and master concepts one by one with visual feedback.",
    tag: "Milestones",
    tone: "fail",
  },
];

function FeatureCard({
  icon,
  title,
  description,
  tag,
  tone,
  featured,
}: Feature) {
  const accent = resolveAccent(tone, undefined);

  return (
    <Box
      component="article"
      style={{ ["--ac" as string]: accent }}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: auroraPalette.radii.card,
        border: `1px solid ${featured ? "color-mix(in oklch, var(--ac) 40%, transparent)" : auroraPalette.line}`,
        padding: "30px 28px 32px",
        background: featured
          ? "linear-gradient(168deg, color-mix(in oklch, var(--ac) 10%, oklch(0.22 0.026 262 / 0.85)), oklch(0.16 0.026 262 / 0.8))"
          : "linear-gradient(168deg, oklch(0.225 0.026 262 / 0.85), oklch(0.16 0.026 262 / 0.78))",
        boxShadow: auroraPalette.shadow.card,
        transition:
          "transform .22s cubic-bezier(0.22, 1, 0.36, 1), border-color .22s ease, box-shadow .22s ease",
        "& .feat-aura": {
          opacity: featured ? 0.6 : 0,
        },
        "&:hover": {
          transform: "translateY(-5px)",
          borderColor: "color-mix(in oklch, var(--ac) 55%, transparent)",
          boxShadow: auroraPalette.shadow.pop,
        },
        "&:hover .feat-aura": {
          opacity: 0.95,
          filter: "blur(28px)",
        },
      }}
    >
      <Box
        className="feat-aura"
        aria-hidden
        sx={{
          position: "absolute",
          top: "-40%",
          left: "-10%",
          width: "55%",
          height: "80%",
          background:
            "radial-gradient(closest-side, color-mix(in oklch, var(--ac) 28%, transparent), transparent)",
          filter: "blur(22px)",
          pointerEvents: "none",
          transition: "opacity .25s ease, filter .25s ease",
        }}
      />

      <Box
        component="span"
        sx={{
          position: "relative",
          zIndex: 1,
          width: 58,
          height: 58,
          borderRadius: "16px",
          display: "grid",
          placeItems: "center",
          background:
            "color-mix(in oklch, var(--ac) 16%, " +
            auroraPalette.surface2 +
            ")",
          border: "1px solid color-mix(in oklch, var(--ac) 28%, transparent)",
          color: "var(--ac)",
          boxShadow:
            "0 0 26px -8px color-mix(in oklch, var(--ac) 70%, transparent)",
        }}
      >
        {icon}
      </Box>

      <Box
        component="h3"
        sx={{
          position: "relative",
          zIndex: 1,
          fontFamily: auroraPalette.font.display,
          fontWeight: 700,
          fontSize: "21px",
          color: auroraPalette.txHi,
          margin: "24px 0 0",
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </Box>

      <Box
        component="p"
        sx={{
          position: "relative",
          zIndex: 1,
          margin: "11px 0 0",
          fontSize: "14.5px",
          lineHeight: 1.6,
          color: auroraPalette.txMid,
          textWrap: "pretty",
        }}
      >
        {description}
      </Box>

      <Box
        component="span"
        sx={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          marginTop: "18px",
          whiteSpace: "nowrap",
          padding: "5px 11px",
          borderRadius: auroraPalette.radii.pill,
          fontFamily: auroraPalette.font.mono,
          fontSize: "11px",
          fontWeight: 600,
          background: "color-mix(in oklch, var(--ac) 13%, transparent)",
          border: "1px solid color-mix(in oklch, var(--ac) 28%, transparent)",
          color: "var(--ac)",
        }}
      >
        {tag}
      </Box>
    </Box>
  );
}

export function FeaturesSection() {
  return (
    <Box component="section" sx={styles.root}>
      <Container maxWidth="lg">
        <Box sx={styles.sectionHeader}>
          <Box component="span" sx={styles.eyebrow}>
            Features
          </Box>
          <Box component="h2" sx={styles.title}>
            The engine behind your education.
          </Box>
          <Box component="p" sx={styles.subtitle}>
            We combine large language models with graph databases to build a
            truly intelligent, personalized learning experience.
          </Box>
        </Box>

        <Box sx={styles.grid}>
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
