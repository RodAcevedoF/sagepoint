"use client";

import { Box, Grid, Typography, Skeleton, alpha } from "@mui/material";
import { LayoutGrid, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState, GoBackButton } from "@/shared/components";
import { useGetCategoryRoomsQuery } from "@/infrastructure/api/categoryRoomApi";
import { palette } from "@/shared/theme";
import { RoomCard } from "./RoomCard";

const MotionBox = motion.create(Box);

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const styles = {
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    p: { xs: 5, md: 8 },
    mb: 6,
    background: `linear-gradient(135deg, ${alpha(palette.background.paper, 0.8)} 0%, ${alpha(palette.background.paper, 0.4)} 100%)`,
    backdropFilter: "blur(16px)",
    border: `1px solid ${alpha(palette.warning.light, 0.1)}`,
    boxShadow: `0 24px 48px ${alpha(palette.background.default, 0.4)}`,
  },
  gradientOrb: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(palette.warning.main, 0.12)} 0%, transparent 70%)`,
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  secondaryOrb: {
    position: "absolute",
    bottom: -150,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(palette.info.main, 0.08)} 0%, transparent 70%)`,
    filter: "blur(50px)",
    pointerEvents: "none",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    px: 2,
    py: 0.5,
    borderRadius: 100,
    bgcolor: alpha(palette.warning.main, 0.1),
    border: `1px solid ${alpha(palette.warning.main, 0.2)}`,
    color: palette.warning.light,
    mb: 3,
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  title: {
    fontWeight: 900,
    mb: 2,
    background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.warning.light} 50%, ${palette.info.light} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: { xs: "2.5rem", md: "3.5rem" },
    letterSpacing: "-1.5px",
    lineHeight: 1.1,
  },
  subtitle: {
    color: palette.text.secondary,
    maxWidth: 540,
    fontSize: "1.1rem",
    lineHeight: 1.6,
    opacity: 0.9,
  },
};

export function RoomGrid() {
  const { data: rooms, isLoading } = useGetCategoryRoomsQuery();

  return (
    <Box>
      {/* Hero */}
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Box sx={styles.hero}>
          <Box sx={styles.gradientOrb} />
          <Box sx={styles.secondaryOrb} />

          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 8, 0],
              opacity: [0.08, 0.16, 0.08],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            style={
              {
                position: "absolute",
                top: "15%",
                right: "12%",
                color: palette.warning.light,
                pointerEvents: "none",
              } as React.CSSProperties
            }
          >
            <LayoutGrid size={52} />
          </motion.div>
          <motion.div
            animate={{ x: [0, 20, 0], opacity: [0.05, 0.12, 0.05] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            style={
              {
                position: "absolute",
                bottom: "22%",
                right: "22%",
                color: palette.info.light,
                pointerEvents: "none",
              } as React.CSSProperties
            }
          >
            <Compass size={40} />
          </motion.div>

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ mb: 2 }}>
              <GoBackButton label="Explore" size="small" />
            </Box>
            <Box sx={styles.badge}>
              <LayoutGrid size={14} />
              Topic Collections
            </Box>
            <Typography variant="h3" sx={styles.title}>
              Category Rooms
            </Typography>
            <Typography variant="body1" sx={styles.subtitle}>
              Browse public roadmaps organized by topic. Find the best learning
              paths in your area of interest.
            </Typography>
          </Box>
        </Box>
      </MotionBox>

      {/* Grid */}
      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton
                variant="rounded"
                height={160}
                sx={{ borderRadius: 6 }}
                animation="wave"
              />
            </Grid>
          ))}
        </Grid>
      ) : !rooms || rooms.length === 0 ? (
        <EmptyState
          title="No rooms yet"
          description="Public roadmaps will appear here once they're created."
        />
      ) : (
        <Grid
          container
          spacing={3}
          component={motion.div}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {rooms.map((room) => (
            <Grid
              key={room.id}
              size={{ xs: 12, sm: 6, md: 4 }}
              component={motion.div}
              variants={item}
            >
              <RoomCard room={room} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
