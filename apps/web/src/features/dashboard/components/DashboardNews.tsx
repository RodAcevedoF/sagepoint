"use client";

import { Box, Typography, Stack, alpha } from "@mui/material";
import { Newspaper, ExternalLink, ArrowRight } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import type { NewsItem } from "../types/dashboard.types";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  card: {
    p: 3,
    height: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
  },
  title: {
    fontWeight: 600,
  },
  viewAll: {
    color: palette.primary.light,
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    cursor: "pointer",
    "&:hover": { textDecoration: "underline" },
  },
  newsItem: {
    p: 2,
    borderRadius: 2,
    bgcolor: alpha(palette.primary.light, 0.05),
    border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
    transition: "all 0.2s ease",
    cursor: "pointer",
    "&:hover": {
      bgcolor: alpha(palette.primary.light, 0.1),
      borderColor: palette.primary.light,
    },
  },
  newsIcon: {
    width: 40,
    height: 40,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(palette.primary.main, 0.15),
    color: palette.primary.light,
    flexShrink: 0,
  },
  category: {
    px: 1,
    py: 0.25,
    borderRadius: 1,
    bgcolor: alpha(palette.primary.light, 0.1),
    color: palette.primary.light,
    fontSize: "0.7rem",
    fontWeight: 500,
  },
  newsItemHover: {
    "& .external-link-icon": {
      opacity: 0,
      transition: "opacity 0.2s ease",
    },
    "&:hover .external-link-icon": {
      opacity: 1,
    },
  },
  externalLink: {
    color: palette.text.secondary,
  },
};

// ============================================================================
// Component
// ============================================================================

interface DashboardNewsProps {
  news: NewsItem[];
}

export function DashboardNews({ news }: DashboardNewsProps) {
  return (
    <Card variant="glass" hoverable={false} sx={styles.card}>
      <Box sx={styles.header}>
        <Typography variant="h6" sx={styles.title}>
          News For You
        </Typography>
        <Typography sx={styles.viewAll}>
          View all <ArrowRight size={14} />
        </Typography>
      </Box>

      <Stack spacing={2}>
        {news.map((item) => (
          <Box
            key={item.id}
            component="a"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ ...styles.newsItem, ...styles.newsItemHover, textDecoration: "none", color: "inherit" }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={styles.newsIcon}>
                <Newspaper size={20} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{
                      flex: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </Typography>
                  <ExternalLink size={14} className="external-link-icon" style={styles.externalLink as React.CSSProperties} />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {item.source}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    •
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.timestamp}
                  </Typography>
                  <Typography component="span" sx={styles.category}>
                    {item.category}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
