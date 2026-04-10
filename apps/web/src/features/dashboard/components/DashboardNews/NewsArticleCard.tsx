import { Box, Typography } from "@mui/material";
import { Newspaper, ExternalLink } from "lucide-react";
import type { NewsArticleDto } from "@/infrastructure/api/insightsApi";
import { Card } from "@/shared/components/ui/Card";
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
      sx={styles.articleCard(color)}
    >
      <Card.Header sx={styles.articleHeader}>
        <Card.IconBox sx={styles.articleIconBox(color)}>
          <Newspaper size={32} />
        </Card.IconBox>
        <Box sx={styles.sourceBadge}>{article.source}</Box>
      </Card.Header>

      <Card.Content sx={styles.articleContent}>
        <Typography sx={styles.categoryLabel(color)}>
          {formatSlug(article.categorySlug)}
        </Typography>
        <Typography sx={styles.articleTitle}>{article.title}</Typography>
        <Typography sx={styles.articleDescription}>
          {article.description}
        </Typography>
      </Card.Content>

      <Box className="news-arrow" sx={{ ...styles.externalIcon, color }}>
        <ExternalLink size={14} />
      </Box>
    </Card>
  );
}
