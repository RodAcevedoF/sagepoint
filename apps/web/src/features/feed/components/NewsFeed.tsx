"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  alpha,
  useTheme,
  keyframes,
  type Theme,
} from "@mui/material";
import { Rss } from "lucide-react";
import {
  Card,
  EmptyState,
  SectionTitle,
  GoBackButton,
} from "@/common/components";
import { useInsightsQuery } from "@/application/insights/queries/get-insights.query";
import { NewsArticleCard } from "@/features/dashboard/components/DahsboardNews/NewsArticleCard";
import { NewsCardSkeleton } from "@/features/dashboard/components/DahsboardNews/NewsCardSkeleton";
import {
  formatSlug,
  getCategoryColor,
} from "@/features/dashboard/components/DahsboardNews/news.utils";
import { palette } from "@/common/theme";

const float = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;

const makeStyles = (theme: Theme) => ({
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 6,
    p: { xs: 4, md: 5 },
    mb: 4,
    background: alpha(palette.background.paper, 0.4),
    backdropFilter: "blur(12px)",
    border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
  },
  heroOrb1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    background: `radial-gradient(circle, ${alpha(palette.info.main, 0.15)} 0%, transparent 70%)`,
    filter: "blur(60px)",
    animation: `${float} 20s ease-in-out infinite`,
    pointerEvents: "none",
  },
  heroOrb2: {
    position: "absolute",
    bottom: -100,
    left: -60,
    width: 250,
    height: 250,
    background: `radial-gradient(circle, ${alpha(palette.primary.main, 0.12)} 0%, transparent 70%)`,
    filter: "blur(50px)",
    animation: `${float} 25s ease-in-out infinite reverse`,
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    px: 2,
    py: 0.8,
    borderRadius: 100,
    bgcolor: alpha(palette.info.main, 0.08),
    border: `1px solid ${alpha(palette.info.main, 0.2)}`,
    backdropFilter: "blur(4px)",
    color: palette.info.light,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    mb: 2,
  },
  statsRow: {
    display: "flex",
    gap: 3,
    mt: 2,
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    color: "text.secondary",
    fontSize: "0.85rem",
  },
  statDot: (color: string) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    bgcolor: color,
    boxShadow: `0 0 8px ${alpha(color, 0.5)}`,
  }),
  chipContainer: {
    display: "flex",
    gap: 0.75,
    mb: 4,
    flexWrap: "wrap",
  },
  chip: (isSelected: boolean, color?: string) => ({
    fontWeight: 600,
    fontSize: "0.8rem",
    bgcolor: isSelected
      ? alpha(color ?? theme.palette.primary.main, 0.15)
      : "transparent",
    color: isSelected
      ? (color ?? theme.palette.primary.light)
      : theme.palette.text.secondary,
    border: `1px solid ${alpha(
      isSelected
        ? (color ?? theme.palette.primary.main)
        : theme.palette.text.secondary,
      isSelected ? 0.35 : 0.15,
    )}`,
    transition: "all 0.25s ease",
    "&:hover": {
      bgcolor: alpha(color ?? theme.palette.primary.main, 0.1),
      borderColor: alpha(color ?? theme.palette.primary.main, 0.3),
    },
  }),
  gridItem: (index: number) => ({
    animation: `feedFadeIn 0.4s ease-out ${index * 0.05}s both`,
    "@keyframes feedFadeIn": {
      from: { opacity: 0, transform: "translateY(16px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
  }),
  emptyCard: {
    p: { xs: 4, md: 6 },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export function NewsFeed() {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { data: articles, isLoading } = useInsightsQuery();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    if (!articles) return [];
    return [...new Set(articles.map((a) => a.categorySlug))].sort();
  }, [articles]);

  const filtered = useMemo(() => {
    if (!articles) return [];
    if (!selectedCategory) return articles;
    return articles.filter((a) => a.categorySlug === selectedCategory);
  }, [articles, selectedCategory]);

  const sourceCount = useMemo(() => {
    if (!articles) return 0;
    return new Set(articles.map((a) => a.source)).size;
  }, [articles]);

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={styles.hero}>
        <Box sx={styles.heroOrb1} />
        <Box sx={styles.heroOrb2} />
        <Box sx={styles.heroContent}>
          <Box sx={{ mb: 2 }}>
            <GoBackButton label="Dashboard" size="small" />
          </Box>
          <Box sx={styles.badge}>
            <Rss size={14} />
            Personalized Feed
          </Box>
          <SectionTitle
            variant="h3"
            subtitle="Curated articles based on your interests and roadmap topics."
            sx={{ mb: 0 }}
          >
            News Feed
          </SectionTitle>
          {!isLoading && articles && (
            <Box sx={styles.statsRow}>
              <Box sx={styles.stat}>
                <Box sx={styles.statDot(palette.info.main)} />
                {articles.length} articles
              </Box>
              <Box sx={styles.stat}>
                <Box sx={styles.statDot(palette.success.main)} />
                {categories.length} topics
              </Box>
              <Box sx={styles.stat}>
                <Box sx={styles.statDot(palette.warning.main)} />
                {sourceCount} sources
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Category Filters */}
      {!isLoading && categories.length > 0 && (
        <Box sx={styles.chipContainer}>
          <Chip
            label="All"
            size="small"
            onClick={() => setSelectedCategory(null)}
            sx={styles.chip(!selectedCategory)}
          />
          {categories.map((slug) => (
            <Chip
              key={slug}
              label={formatSlug(slug)}
              size="small"
              onClick={() => setSelectedCategory(slug)}
              sx={styles.chip(
                selectedCategory === slug,
                getCategoryColor(slug),
              )}
            />
          ))}
          {selectedCategory && (
            <Typography
              variant="body2"
              sx={{
                alignSelf: "center",
                color: "text.secondary",
                ml: 1,
              }}
            >
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>
      )}

      {/* Content */}
      {isLoading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <NewsCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Card variant="glass" hoverable={false} sx={styles.emptyCard}>
          <EmptyState
            title="No articles found"
            description={
              selectedCategory
                ? "No articles in this category. Try a different filter."
                : "Complete onboarding or create roadmaps to get personalized news."
            }
          />
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((article, index) => (
            <Grid
              key={article.url}
              size={{ xs: 12, sm: 6, md: 4 }}
              sx={styles.gridItem(index)}
            >
              <NewsArticleCard article={article} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
