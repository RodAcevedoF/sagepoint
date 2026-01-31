"use client";

import { Box, Container, Typography, Grid, alpha } from "@mui/material";
import {
  AutoStories as LearnIcon,
  AccountTree as GraphIcon,
  Psychology as BrainIcon,
  Speed as FastIcon,
  Search as SearchIcon,
  Timeline as ProgressIcon,
} from "@mui/icons-material";
import { ReactNode } from "react";
import { palette } from "@/common/theme";

const styles = {
  root: {
    py: { xs: 10, md: 15 },
    position: "relative",
    bgcolor: "background.default",
  },
  sectionHeader: {
    mb: 8,
    textAlign: "center",
  },
  tagline: {
    color: palette.primary.light,
    fontWeight: 600,
    fontSize: "0.875rem",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    mb: 2,
    display: "block",
  },
  title: {
    fontSize: { xs: "2.5rem", md: "3.5rem" },
    fontWeight: 800,
    letterSpacing: "-0.02em",
    mb: 3,
    color: "text.primary",
    background: `linear-gradient(180deg, ${palette.text.primary} 30%, ${alpha(palette.text.primary, 0.7)} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "text.secondary",
    maxWidth: 600,
    mx: "auto",
    fontSize: "1.125rem",
    lineHeight: 1.6,
  },
  gridContainer: {
    mt: 4,
  },
  card: {
    height: "100%",
    p: { xs: 3, md: 4 },
    borderRadius: 6,
    background: alpha(palette.background.paper, 0.4),
    backdropFilter: "blur(12px)",
    border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-8px)",
      borderColor: alpha(palette.primary.light, 0.4),
      bgcolor: alpha(palette.background.paper, 0.6),
      boxShadow: `0 20px 40px ${alpha(palette.primary.main, 0.15)}`,
      "& .feature-icon-box": {
        bgcolor: alpha(palette.primary.main, 0.2),
        color: palette.primary.light,
        transform: "scale(1.05)",
      },
    },
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(palette.primary.main, 0.1),
    mb: 3,
    color: palette.primary.light,
    transition: "all 0.3s ease",
  },
};

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  gridSpan: { xs: number; md: number };
}

const features: Feature[] = [
  {
    icon: <LearnIcon fontSize="large" />,
    title: "Document Normalization",
    description:
      "Upload PDF, DOCX, or XLSX. Our engine extracts text and structure with high precision for AI analysis, ensuring no detail is lost.",
    gridSpan: { xs: 12, md: 7 },
  },
  {
    icon: <FastIcon fontSize="large" />,
    title: "Instant Roadmaps",
    description:
      "Go from raw documents to structured learning paths in seconds.",
    gridSpan: { xs: 12, md: 5 },
  },
  {
    icon: <GraphIcon fontSize="large" />,
    title: "Knowledge Graphs",
    description:
      "Visualize relationships between concepts with interactive Neo4j-powered graphs that show how ideas connect.",
    gridSpan: { xs: 12, md: 5 },
  },
  {
    icon: <BrainIcon fontSize="large" />,
    title: "Personalized AI",
    description:
      "The AI adapts to your current expertise and goals, pruning unnecessary topics and highlighting critical prerequisites.",
    gridSpan: { xs: 12, md: 7 },
  },
  {
    icon: <SearchIcon fontSize="large" />,
    title: "Smart Discovery",
    description:
      "Automatically find related topics and bridge knowledge gaps you didn't know you had.",
    gridSpan: { xs: 12, md: 6 },
  },
  {
    icon: <ProgressIcon fontSize="large" />,
    title: "Progress Tracking",
    description:
      "Keep track of your learning milestones and master concepts one by one with visual feedback.",
    gridSpan: { xs: 12, md: 6 },
  },
];

function FeatureCard({ icon, title, description }: Omit<Feature, "gridSpan">) {
  return (
    <Box sx={styles.card}>
      <Box className="feature-icon-box" sx={styles.iconBox}>
        {icon}
      </Box>
      <Typography
        variant="h5"
        fontWeight="700"
        gutterBottom
        sx={{ color: "text.primary", letterSpacing: "-0.01em" }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ lineHeight: 1.7, fontSize: "0.95rem" }}
      >
        {description}
      </Typography>
    </Box>
  );
}

export function FeaturesSection() {
  return (
    <Box sx={styles.root}>
      <Container maxWidth="lg">
        <Box sx={styles.sectionHeader}>
          <Typography component="span" sx={styles.tagline}>
            Features
          </Typography>
          <Typography variant="h2" sx={styles.title}>
            The engine behind <br />
            your education.
          </Typography>
          <Typography variant="body1" sx={styles.subtitle}>
            We combine large language models with graph databases to build a
            truly intelligent, personalized learning experience.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={styles.gridContainer}>
          {features.map((feature, index) => (
            <Grid
              key={index}
              size={{ xs: feature.gridSpan.xs, md: feature.gridSpan.md }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
