"use client";

import { useMemo, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { Rss, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { useInsightsQuery } from "@/application/insights/queries/get-insights.query";
import { NewsArticleCard } from "@/features/dashboard/components/DashboardNews/NewsArticleCard";
import { NewsCardSkeleton } from "@/features/dashboard/components/DashboardNews/NewsCardSkeleton";
import { formatSlug } from "@/features/dashboard/components/DashboardNews/news.utils";

const styles = {
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "26px",
    border: `1px solid ${auroraPalette.line}`,
    background:
      "radial-gradient(560px 320px at 90% 10%, oklch(0.42 0.10 195 / 0.12), transparent 70%), linear-gradient(160deg, oklch(0.235 0.03 250 / 0.7), oklch(0.165 0.03 264 / 0.6))",
    boxShadow: auroraPalette.shadow.card,
    mt: "30px",
    p: { xs: "26px 24px 28px", md: "34px 38px 36px" },
    mb: 4,
  },
  spBack: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    px: "13px",
    py: "10px",
    borderRadius: auroraPalette.radii.md,
    cursor: "pointer",
    background: auroraTint(auroraPalette.teal, 0.08),
    border: `1px solid ${auroraTint(auroraPalette.teal, 0.3)}`,
    color: auroraPalette.teal,
    fontWeight: 600,
    fontSize: "14px",
    transition: "all .15s",
    whiteSpace: "nowrap",
    "&:hover": {
      background: auroraTint(auroraPalette.teal, 0.15),
      transform: "translateX(-2px)",
    },
  },
  feedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    mt: 2.5,
    px: "15px",
    py: "7px",
    borderRadius: "999px",
    fontFamily: auroraPalette.font.mono,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: auroraPalette.status.concept,
    background: auroraTint(auroraPalette.status.concept, 0.1),
    border: `1px solid ${auroraTint(auroraPalette.status.concept, 0.3)}`,
    whiteSpace: "nowrap",
  },
  feedTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    mt: "18px",
  },
  feedTitleBar: {
    width: 6,
    alignSelf: "stretch",
    minHeight: 52,
    borderRadius: "999px",
    background: `linear-gradient(180deg, ${auroraPalette.teal}, ${auroraPalette.status.concept})`,
  },
  feedTitle: {
    fontFamily: auroraPalette.font.display,
    fontWeight: 800,
    fontSize: "clamp(40px, 5vw, 64px)",
    letterSpacing: "-0.03em",
    lineHeight: 1,
    m: 0,
    background: `linear-gradient(115deg, ${auroraPalette.txHi} 30%, ${auroraPalette.teal} 100%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  lede: {
    mt: 2,
    mb: 0,
    fontSize: "16.5px",
    color: auroraPalette.txMid,
  },
  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    mt: "22px",
  },
  stat: (dotColor: string) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    fontSize: "14px",
    color: auroraPalette.tx,
    "&::before": {
      content: '""',
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: dotColor,
    },
    "& b": {
      fontFamily: auroraPalette.font.mono,
      color: auroraPalette.txHi,
      fontWeight: 600,
    },
  }),
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
  const router = useRouter();
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

  return (
    <Box sx={{ mb: 10 }}>
      <Box component="section" sx={styles.hero}>
        <Box
          component="span"
          sx={styles.spBack}
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft size={17} /> Dashboard
        </Box>
        <Box>
          <Box component="span" sx={styles.feedBadge}>
            <Rss size={13} /> Personalized Feed
          </Box>
        </Box>
        <Box sx={styles.feedTitleRow}>
          <Box sx={styles.feedTitleBar} />
          <Box component="h1" sx={styles.feedTitle}>
            News Feed
          </Box>
        </Box>
        <Typography component="p" sx={styles.lede}>
          Curated articles based on your interests and roadmap topics.
        </Typography>
        {!isLoading && articles && articles.length > 0 && (
          <Box sx={styles.stats}>
            <Box
              component="span"
              sx={styles.stat(auroraPalette.status.concept)}
            >
              <b>{articles.length}</b> articles
            </Box>
            <Box component="span" sx={styles.stat(auroraPalette.status.ready)}>
              <b>{categories.length}</b> topics
            </Box>
            <Box component="span" sx={styles.stat(auroraPalette.status.proc)}>
              <b>{sourceCount}</b> sources
            </Box>
          </Box>
        )}
      </Box>

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
