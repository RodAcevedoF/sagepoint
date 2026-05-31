import { Box, Typography } from "@mui/material";
import { Newspaper, ArrowRight } from "lucide-react";
import type { NewsArticleDto } from "@/infrastructure/api/insightsApi";
import { Card } from "@/shared/components/ui/Card";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { toneColor } from "@/shared/components/ui/Aurora/tones";
import { categoryFeedTone, formatSlug, formatRelativeTime } from "./news.utils";

export function NewsArticleCard({ article }: { article: NewsArticleDto }) {
  const tone = categoryFeedTone(article.categorySlug);
  const accent = toneColor(tone);

  return (
    <Card
      variant="aurora"
      tone={tone}
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      withAura={false}
      sx={{
        textDecoration: "none",
        "&:hover .news-read-arrow": { transform: "translateX(3px)" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          p: "22px 22px 0",
        }}
      >
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            background: `color-mix(in oklch, ${accent} 16%, ${auroraPalette.surface2})`,
            border: `1px solid ${auroraTint(accent, 0.28)}`,
            color: accent,
            boxShadow: `0 0 22px -8px ${auroraTint(accent, 0.7)}`,
            flexShrink: 0,
          }}
        >
          <Newspaper size={24} />
        </Box>
        <Typography
          sx={{
            fontFamily: auroraPalette.font.mono,
            fontSize: "12px",
            color: auroraPalette.txLow,
            textAlign: "right",
            wordBreak: "break-word",
          }}
        >
          {article.source}
        </Typography>
      </Box>

      <Box
        sx={{
          p: "18px 22px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 1.1,
          flex: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: auroraPalette.font.mono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {formatSlug(article.categorySlug)}
        </Typography>
        <Typography
          component="h3"
          sx={{
            fontFamily: auroraPalette.font.display,
            fontWeight: 700,
            fontSize: "17.5px",
            lineHeight: 1.25,
            color: auroraPalette.txHi,
            letterSpacing: "-0.01em",
            m: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </Typography>
        <Typography
          component="p"
          sx={{
            fontSize: "13.5px",
            lineHeight: 1.55,
            color: auroraPalette.txMid,
            m: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.description}
        </Typography>
      </Box>

      <Box
        sx={{
          mt: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: "14px 22px",
          borderTop: `1px solid ${auroraPalette.line}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: auroraPalette.font.mono,
            fontSize: "11.5px",
            color: auroraPalette.txLow,
          }}
        >
          {formatRelativeTime(article.publishedAt)}
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            fontSize: "13px",
            fontWeight: 600,
            color: accent,
          }}
        >
          Read
          <Box
            className="news-read-arrow"
            sx={{
              display: "inline-flex",
              transition: "transform .15s",
            }}
          >
            <ArrowRight size={15} />
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
