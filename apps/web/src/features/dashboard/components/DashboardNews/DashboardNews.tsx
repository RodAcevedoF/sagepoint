"use client";

import { Box, Grid, Typography } from "@mui/material";
import { Brain, Sparkles, ArrowRight } from "lucide-react";
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
    <Card variant="aurora" hoverable={false} withAura={false} sx={styles.card}>
      <Box sx={styles.aura} />
      <Box sx={styles.header}>
        <Box sx={styles.titleWrap}>
          <Box sx={styles.titleIcon}>
            <Brain size={22} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" sx={styles.title}>
              Your Briefing
            </Typography>
            <Box sx={styles.meta}>
              <Sparkles size={12} /> AI-generated · updated this morning
            </Box>
          </Box>
        </Box>
        <Typography component={Link} href="/feed" sx={styles.feedLink}>
          Feed <ArrowRight size={14} />
        </Typography>
      </Box>

      {isLoading ? (
        <Grid container spacing={2} sx={styles.grid}>
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
        <Grid container spacing={2} sx={styles.grid}>
          {displayItems.map((item) => (
            <Grid key={item.url} size={{ xs: 12, sm: 6, md: 3 }}>
              <NewsArticleCard article={item} />
            </Grid>
          ))}
        </Grid>
      )}
    </Card>
  );
}
