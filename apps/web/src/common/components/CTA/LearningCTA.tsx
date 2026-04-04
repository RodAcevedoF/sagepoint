import {
  Box,
  Typography,
  alpha,
  Stack,
  Container,
  useTheme,
  type Theme,
} from "@mui/material";
import { BookOpen, Map, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

const makeStyles = (theme: Theme) => ({
  container: {
    mt: { xs: 8, md: 12 },
    mb: { xs: 4, md: 6 },
  },
  card: {
    position: "relative",
    borderRadius: { xs: 4, md: 6 },
    overflow: "hidden",
    p: { xs: 4, md: 5 },
    bgcolor: alpha(theme.palette.background.paper, 0.3),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: alpha(theme.palette.primary.main, 0.15),
      bgcolor: alpha(theme.palette.background.paper, 0.45),
    },
  },
  bgGlow: {
    position: "absolute",
    top: "-50%",
    right: "-10%",
    width: "50%",
    height: "200%",
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)`,
    zIndex: 0,
    pointerEvents: "none",
  },
  contentStack: {
    position: "relative",
    zIndex: 1,
  },
  title: {
    fontWeight: 700,
    color: theme.palette.text.primary,
    letterSpacing: "-0.01em",
  },
  description: {
    color: theme.palette.text.secondary,
    lineHeight: 1.6,
    opacity: 0.8,
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    height: 48,
    px: 3.5,
    borderRadius: 3,
    bgcolor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.light,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.9rem",
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    transition: "all 0.2s ease",
    flexShrink: 0,
    "&:hover": {
      bgcolor: alpha(theme.palette.primary.main, 0.18),
      borderColor: alpha(theme.palette.primary.main, 0.35),
      transform: "translateY(-1px)",
    },
  },
});

interface LearningCTAProps {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
  icon?: LucideIcon;
}

const defaults = {
  documents: {
    title: "Continue exploring your documents",
    description: "Upload files and extract concepts for targeted roadmaps.",
    href: "/documents",
    label: "Go to Library",
    icon: BookOpen,
  },
  roadmaps: {
    title: "Ready to keep learning?",
    description: "Pick up where you left off or start a new roadmap.",
    href: "/roadmaps",
    label: "View Roadmaps",
    icon: Map,
  },
};

export function LearningCTA(props: LearningCTAProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const {
    title = defaults.documents.title,
    description = defaults.documents.description,
    href = defaults.documents.href,
    label = defaults.documents.label,
    icon: Icon = defaults.documents.icon,
  } = props;

  return (
    <Container maxWidth="lg" sx={styles.container}>
      <Box sx={styles.card}>
        <Box sx={styles.bgGlow} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={3}
          sx={styles.contentStack}
        >
          <Box>
            <Typography variant="h6" sx={styles.title}>
              {title}
            </Typography>
            <Typography variant="body2" sx={styles.description}>
              {description}
            </Typography>
          </Box>

          <Box component={Link} href={href} sx={styles.btn}>
            <Icon size={18} />
            {label}
            <ArrowRight size={16} />
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}

LearningCTA.presets = defaults;
