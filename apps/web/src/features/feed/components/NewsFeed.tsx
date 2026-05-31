"use client";

import { useMemo, useState } from "react";
import { Box, Grid } from "@mui/material";
import { Rss } from "lucide-react";
import { AuroraHero, EmptyState } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { useInsightsQuery } from "@/application/insights/queries/get-insights.query";
import { NewsArticleCard } from "@/features/dashboard/components/DashboardNews/NewsArticleCard";
import { NewsCardSkeleton } from "@/features/dashboard/components/DashboardNews/NewsCardSkeleton";
import { formatSlug } from "@/features/dashboard/components/DashboardNews/news.utils";

const styles = {
  tabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: 1.4,
    mt: 4,
    mb: 3,
  },
  tab: (on: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 1.25,
    px: "18px",
    py: "11px",
    borderRadius: "999px",
    cursor: "pointer",
    border: `1px solid ${on ? auroraTint(auroraPalette.teal, 0.45) : auroraPalette.line}`,
    background: on
      ? auroraTint(auroraPalette.teal, 0.13)
      : "oklch(0.22 0.025 262 / 0.5)",
    color: on ? auroraPalette.teal : auroraPalette.txMid,
    fontWeight: 600,
    fontSize: "14.5px",
    transition: "all .15s",
    whiteSpace: "nowrap",
    "&:hover": on
      ? {}
      : {
          color: auroraPalette.txHi,
          borderColor: auroraPalette.line2,
        },
  }),
  tabCount: (on: boolean) => ({
    fontFamily: auroraPalette.font.mono,
    fontSize: "11.5px",
    fontWeight: 700,
    px: 1,
    py: 0.25,
    borderRadius: "999px",
    background: on
      ? auroraTint(auroraPalette.teal, 0.2)
      : "oklch(0.30 0.02 262 / 0.7)",
    color: on ? auroraPalette.teal : auroraPalette.txMid,
  }),
  emptyCard: {
    p: { xs: 4, md: 6 },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: auroraPalette.radii.card,
    border: `1px solid ${auroraPalette.line}`,
    background:
      "linear-gradient(168deg, oklch(0.225 0.026 262 / 0.85), oklch(0.16 0.026 262 / 0.78))",
  },
} as const;

export function NewsFeed() {
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

  const tabs: Array<{ value: string | null; label: string; count: number }> = [
    { value: null, label: "All", count: articles?.length ?? 0 },
    ...categories.map((slug) => ({
      value: slug,
      label: formatSlug(slug),
      count: articles?.filter((a) => a.categorySlug === slug).length ?? 0,
    })),
  ];

  const heroStats =
    !isLoading && articles && articles.length > 0
      ? [
          {
            value: articles.length,
            label: "articles",
            dotColor: auroraPalette.status.concept,
          },
          {
            value: categories.length,
            label: "topics",
            dotColor: auroraPalette.status.ready,
          },
          {
            value: sourceCount,
            label: "sources",
            dotColor: auroraPalette.status.proc,
          },
        ]
      : undefined;

  return (
    <Box sx={{ mb: 10 }}>
      <AuroraHero
        eyebrow="Personalized Feed"
        eyebrowIcon={<Rss size={13} />}
        title="News Feed"
        lede="Curated articles based on your interests and roadmap topics."
        backLink={{ label: "Dashboard", href: "/dashboard" }}
        stats={heroStats}
        glyph={<Rss size={140} strokeWidth={1.2} />}
      />

      {!isLoading && categories.length > 0 && (
        <Box sx={styles.tabs}>
          {tabs.map((t) => {
            const on = selectedCategory === t.value;
            return (
              <Box
                key={t.value ?? "__all__"}
                component="span"
                sx={styles.tab(on)}
                onClick={() => setSelectedCategory(t.value)}
              >
                {t.label}
                <Box component="span" sx={styles.tabCount(on)}>
                  {t.count}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {isLoading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <NewsCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box sx={styles.emptyCard}>
          <EmptyState
            title="No articles found"
            description={
              selectedCategory
                ? "No articles in this category. Try a different filter."
                : "Complete onboarding or create roadmaps to get personalized news."
            }
          />
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((article) => (
            <Grid key={article.url} size={{ xs: 12, sm: 6, md: 4 }}>
              <NewsArticleCard article={article} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
