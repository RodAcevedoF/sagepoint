"use client";

import { Box, Typography, alpha } from "@mui/material";
import { Compass, Globe, Users, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { palette } from "@/shared/theme";

const MotionBox = motion.create(Box);

const floaterStyle = (overrides: React.CSSProperties): React.CSSProperties => ({
  position: "absolute",
  pointerEvents: "none",
  ...overrides,
});

const styles = {
  container: { mb: 6, position: "relative" },
  card: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    p: { xs: 5, md: 8 },
    background: `linear-gradient(135deg, ${alpha(palette.background.paper, 0.8)} 0%, ${alpha(palette.background.paper, 0.4)} 100%)`,
    backdropFilter: "blur(16px)",
    border: `1px solid ${alpha(palette.secondary.light, 0.1)}`,
    boxShadow: `0 24px 48px ${alpha(palette.background.default, 0.4)}`,
  },
  gradientOrb: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(palette.secondary.main, 0.15)} 0%, transparent 70%)`,
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  secondaryOrb: {
    position: "absolute",
    bottom: -150,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(palette.success.main, 0.08)} 0%, transparent 70%)`,
    filter: "blur(50px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    px: 2,
    py: 0.5,
    borderRadius: 100,
    bgcolor: alpha(palette.secondary.main, 0.1),
    border: `1px solid ${alpha(palette.secondary.main, 0.2)}`,
    color: palette.secondary.light,
    mb: 3,
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    position: "relative",
    zIndex: 1,
  },
  title: {
    fontWeight: 900,
    mb: 2,
    background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.secondary.light} 50%, ${palette.success.light} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: { xs: "2.5rem", md: "3.5rem" },
    letterSpacing: "-1.5px",
    lineHeight: 1.1,
    position: "relative",
    zIndex: 1,
  },
  subtitle: {
    color: palette.text.secondary,
    mb: 2,
    maxWidth: 540,
    fontSize: "1.1rem",
    lineHeight: 1.6,
    position: "relative",
    zIndex: 1,
    opacity: 0.9,
  },
};

export function ExploreHero() {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      sx={styles.container}
    >
      <Box sx={styles.card}>
        <Box sx={styles.gradientOrb} />
        <Box sx={styles.secondaryOrb} />

        <motion.div
          animate={{
            y: [0, -18, 0],
            rotate: [0, 12, 0],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={floaterStyle({
            top: "15%",
            right: "12%",
            color: palette.secondary.light,
          })}
        >
          <Globe size={52} />
        </motion.div>

        <motion.div
          animate={{ x: [0, 25, 0], opacity: [0.05, 0.12, 0.05] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          style={floaterStyle({
            bottom: "22%",
            right: "22%",
            color: palette.success.light,
          })}
        >
          <Users size={40} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0], opacity: [0.04, 0.1, 0.04] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          style={floaterStyle({
            top: "25%",
            left: "8%",
            color: palette.info.light,
          })}
        >
          <Heart size={32} />
        </motion.div>

        <Box sx={styles.badge}>
          <Compass size={14} />
          Community
        </Box>

        <Typography variant="h3" sx={styles.title}>
          Explore Roadmaps
        </Typography>

        <Typography variant="body1" sx={styles.subtitle}>
          Discover learning paths shared by the community. Find inspiration and
          start learning from curated roadmaps.
        </Typography>
      </Box>
    </MotionBox>
  );
}
