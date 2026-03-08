import { Box, Typography, Stack } from '@mui/material';
import { Newspaper, ExternalLink } from 'lucide-react';
import type { NewsArticleDto } from '@/infrastructure/api/insightsApi';
import { styles } from './news.styles';
import { getCategoryColor, formatSlug } from './news.utils';
//@TODO - Refactor using common Card at /common
export function NewsArticleCard({ article }: { article: NewsArticleDto }) {
	const color = getCategoryColor(article.categorySlug);

	return (
		<Box
			component='a'
			href={article.url}
			target='_blank'
			rel='noopener noreferrer'
			sx={styles.articleCard(color)}>
			<Stack
				direction='row'
				justifyContent='space-between'
				alignItems='flex-start'>
				<Box sx={styles.iconBox(color)}>
					<Newspaper size={22} />
				</Box>
				<Box sx={styles.sourceBadge}>{article.source}</Box>
			</Stack>

			<Box>
				<Typography
					variant='subtitle2'
					sx={styles.categoryLabel(color)}
					gutterBottom>
					{formatSlug(article.categorySlug)}
				</Typography>
				<Typography variant='body2' sx={styles.articleTitle}>
					{article.title}
				</Typography>
				<Typography variant='caption' sx={styles.articleDescription}>
					{article.description}
				</Typography>
			</Box>

			<Box className='news-arrow' sx={{ ...styles.externalIcon, color }}>
				<ExternalLink size={16} />
			</Box>
		</Box>
	);
}
