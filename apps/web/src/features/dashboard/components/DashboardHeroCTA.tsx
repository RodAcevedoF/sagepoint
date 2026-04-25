"use client";

import { Box, Typography, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { Map } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/components";
import { Button } from "@/shared/components/ui/Button/Button";
import { ButtonVariants } from "@/shared/types";
import { palette } from "@/shared/theme";

const styles = {
  card: {
    p: { xs: 3, md: 4 },
    mb: 3,
    position: "relative",
    overflow: "hidden",
    borderColor: alpha(palette.primary.main, 0.2),
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse at 20% 50%, ${alpha(palette.primary.main, 0.12)} 0%, transparent 70%)`,
      pointerEvents: "none",
    },
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 3,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(palette.primary.main, 0.15),
    color: palette.primary.light,
    flexShrink: 0,
  },
  title: {
    fontWeight: 700,
    mb: 0.5,
  },
  description: {
    maxWidth: 420,
  },
};

export function DashboardHeroCTA() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card variant="glass" hoverable={false} sx={styles.card}>
        <Box sx={styles.row}>
          <Box sx={styles.left}>
            <Box sx={styles.iconBox}>
              <Map size={28} />
            </Box>
            <Box>
              <Typography variant="h5" sx={styles.title}>
                Start your learning journey
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={styles.description}
              >
                Create a roadmap from a document or a topic — Sagepoint will
                build a personalized learning path for you.
              </Typography>
            </Box>
          </Box>
          <Button
            label="Create your first roadmap"
            onClick={() => router.push("/roadmaps/create")}
            variant={ButtonVariants.DEFAULT}
          />
        </Box>
      </Card>
    </motion.div>
  );
}
