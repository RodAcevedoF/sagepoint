import { Box, Typography, alpha } from "@mui/material";
import { Newspaper, ExternalLink } from "lucide-react";
import type { NewsArticleDto } from "@/infrastructure/api/insightsApi";
import { Card } from "@/common/components/Card";
import { styles } from "./news.styles";
import { getCategoryColor, formatSlug } from "./news.utils";

export function NewsArticleCard({ article }: { article: NewsArticleDto }) {
  const color = getCategoryColor(article.categorySlug);

  return (
    <Card
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      variant="outlined"
      sx={{
        bgcolor: alpha(color, 0.05),
        border: `1px solid ${alpha(color, 0.1)}`,
        borderRadius: 3,
        p: 2.5,
        gap: 1.5,
        textDecoration: "none",
        "&:hover": {
          bgcolor: alpha(color, 0.08),
          borderColor: color,
          transform: "translateY(-4px)",
          boxShadow: `0 8px 16px ${alpha(color, 0.1)}`,
          "& .news-arrow": { transform: "translateX(4px)", opacity: 1 },
        },
      }}
    >
      <Card.Header sx={{ p: 0, pb: 0, justifyContent: "space-between" }}>
        <Card.IconBox
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: alpha(color, 0.15),
            color,
          }}
        >
          <Newspaper size={22} />
        </Card.IconBox>
        <Box sx={styles.sourceBadge}>{article.source}</Box>
      </Card.Header>

      <Card.Content sx={{ p: 0, flexGrow: 1 }}>
        <Typography
          variant="subtitle2"
          sx={styles.categoryLabel(color)}
          gutterBottom
        >
          {formatSlug(article.categorySlug)}
        </Typography>
        <Typography variant="body2" sx={styles.articleTitle}>
          {article.title}
        </Typography>
        <Typography variant="caption" sx={styles.articleDescription}>
          {article.description}
        </Typography>
      </Card.Content>

      <Box className="news-arrow" sx={{ ...styles.externalIcon, color }}>
        <ExternalLink size={16} />
      </Box>
    </Card>
  );
}
