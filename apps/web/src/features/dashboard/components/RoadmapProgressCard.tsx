"use client";

import { Box, Typography, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { Trophy, Zap, Sparkles } from "lucide-react";
import { Card } from "@/shared/components";
import { palette } from "@/shared/theme";
import type { RoadmapItem } from "../types/dashboard.types";

interface RoadmapProgressCardProps {
  item: RoadmapItem;
  color: { main: string; light: string };
  index: number;
  onClick: (id: string) => void;
}

const styles = {
  cardWrap: {
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  inner: {
    px: 2,
    py: 1.5,
    position: "relative" as const,
    zIndex: 1,
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    gap: 1.25,
    mb: 1.25,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemTitle: {
    fontWeight: 600,
    fontSize: "0.9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
    minWidth: 0,
  },
  pct: {
    fontSize: "1.05rem",
    fontWeight: 800,
    lineHeight: 1,
    flexShrink: 0,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    mt: 0.85,
  },
  metaDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    flexShrink: 0,
  },
  meta: {
    color: palette.text.secondary,
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  metaCount: {
    fontSize: "0.75rem",
    fontWeight: 700,
  },
};

export function RoadmapProgressCard({
  item,
  color,
  index,
  onClick,
}: RoadmapProgressCardProps) {
  const trackColor = alpha(color.main, 0.12);

  // Subtle two-stop tint: stronger glow in the top-left, fading out across
  // the card. Gives depth without a hard stripe.
  const cardGradient = `radial-gradient(circle at 0% 0%, ${alpha(color.main, 0.18)} 0%, ${alpha(color.main, 0.06)} 45%, ${alpha(color.main, 0.03)} 100%)`;
  const cardGradientHover = `radial-gradient(circle at 0% 0%, ${alpha(color.main, 0.28)} 0%, ${alpha(color.main, 0.12)} 45%, ${alpha(color.main, 0.06)} 100%)`;

  return (
    <Card
      variant="outlined"
      hoverable={false}
      onClick={() => onClick(item.id)}
      sx={{
        ...styles.cardWrap,
        background: cardGradient,
        borderColor: alpha(color.main, 0.28),
        cursor: "pointer",
        transition: "background .2s, transform .2s, border-color .2s",
        "&:hover": {
          background: cardGradientHover,
          borderColor: alpha(color.light, 0.45),
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box sx={styles.inner}>
        <Box sx={styles.topRow}>
          <Box
            sx={{
              ...styles.iconChip,
              background: `linear-gradient(135deg, ${alpha(color.light, 0.35)}, ${alpha(color.main, 0.18)})`,
              color: color.light,
              border: `1px solid ${alpha(color.light, 0.4)}`,
              boxShadow: `0 0 12px ${alpha(color.main, 0.35)}`,
            }}
          >
            {item.progressPercentage >= 100 ? (
              <Trophy size={16} strokeWidth={2.4} />
            ) : item.progressPercentage > 0 ? (
              <Zap size={16} strokeWidth={2.4} />
            ) : (
              <Sparkles size={16} strokeWidth={2.4} />
            )}
          </Box>
          <Typography sx={styles.itemTitle}>{item.title}</Typography>
          <Typography sx={{ ...styles.pct, color: color.light }}>
            {item.progressPercentage}%
          </Typography>
        </Box>

        <Box sx={{ ...styles.progressBar, bgcolor: trackColor }}>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: `${item.progressPercentage}%`,
              background: `linear-gradient(90deg, ${color.main}, ${color.light})`,
              borderRadius: 4,
              transformOrigin: "left",
              boxShadow: `0 0 10px ${alpha(color.main, 0.5)}`,
            }}
          />
        </Box>

        <Box sx={styles.metaRow}>
          <Box
            sx={{
              ...styles.metaDot,
              background: color.light,
              boxShadow: `0 0 6px ${alpha(color.main, 0.7)}`,
            }}
          />
          <Typography sx={{ ...styles.metaCount, color: color.light }}>
            {item.completedSteps}
          </Typography>
          <Typography sx={styles.meta}>
            of {item.totalSteps} steps completed
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
