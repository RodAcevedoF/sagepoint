"use client";

import { Box, Typography, Grid } from "@mui/material";
import { Newspaper, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, EmptyState } from "@/common/components";
import { useInsightsQuery } from "@/application/insights/queries/get-insights.query";
import { styles } from "./news.styles";
import { NewsArticleCard } from "./NewsArticleCard";
import { NewsCardSkeleton } from "./NewsCardSkeleton";

export function DashboardNews() {
  const { data: articles, isLoading } = useInsightsQuery();
  const displayItems = (articles ?? []).slice(0, 4);

  return (
    <Card sx={styles.card} variant="glass">
      <Box sx={styles.header}>
        <Typography variant="h6" sx={styles.title}>
          <Box sx={styles.titleIcon}>
            <Newspaper size={18} />
          </Box>
          Learning Insights
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
        <Grid container spacing={2.5} sx={{ flex: 1 }}>
          {[0, 1].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6 }}>
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
        <Grid container spacing={2.5} sx={{ flex: 1 }}>
          {displayItems.map((item) => (
            <Grid key={item.url} size={{ xs: 12, sm: 6 }}>
              <NewsArticleCard article={item} />
            </Grid>
          ))}
        </Grid>
      )}
    </Card>
  );
}
