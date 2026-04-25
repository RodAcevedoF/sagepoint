"use client";

import { Box, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { Newspaper, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, EmptyState } from "@/shared/components";
import { useInsightsQuery } from "@/application/insights/queries/get-insights.query";
import { styles } from "./news.styles";
import { NewsArticleCard } from "./NewsArticleCard";
import { NewsCardSkeleton } from "./NewsCardSkeleton";

export function DashboardNews() {
  const { data: articles, isLoading } = useInsightsQuery();
  const displayItems = (articles ?? []).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4, ease: "easeOut" }}
    >
      <Card sx={styles.card} variant="glass">
        <Box sx={styles.header}>
          <Typography variant="h6" sx={styles.title}>
            <Box sx={styles.titleIcon}>
              <Newspaper size={18} />
            </Box>
            Your Briefing
          </Typography>
          <Typography
            component={Link}
            href="/feed"
            variant="body2"
            sx={{ ...styles.feedLink, textDecoration: "none" }}
          >
            Feed <ArrowRight size={14} />
          </Typography>
        </Box>

        {isLoading ? (
          <Grid container spacing={2} sx={{ flex: 1 }}>
            {[0, 1, 2, 3].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <NewsCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : displayItems.length === 0 ? (
          <EmptyState
            title="No insights yet"
            description="Complete onboarding or create roadmaps to get personalized news."
          />
        ) : (
          <Grid container spacing={2} sx={{ flex: 1 }}>
            {displayItems.map((item) => (
              <Grid key={item.url} size={{ xs: 12, sm: 6, md: 3 }}>
                <NewsArticleCard article={item} />
              </Grid>
            ))}
          </Grid>
        )}
      </Card>
    </motion.div>
  );
}
