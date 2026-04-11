"use client";

import {
  Box,
  CircularProgress,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

export function GeneratingPhase() {
  const theme = useTheme();

  return (
    <MotionBox
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        py: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 64,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          size={64}
          thickness={2}
          sx={{
            color: alpha(theme.palette.primary.main, 0.3),
            position: "absolute",
          }}
        />
        <Sparkles size={28} color={theme.palette.primary.light} />
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          Building your learning path
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Analyzing document concepts and creating a personalized roadmap...
        </Typography>
      </Box>
    </MotionBox>
  );
}
