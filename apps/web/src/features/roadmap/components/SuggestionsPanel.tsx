'use client';

import { Box, Typography, useTheme, alpha } from '@mui/material';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetSuggestionsQuery } from '@/infrastructure/api/roadmapApi';
import { Card } from '@/common/components';

const MotionBox = motion.create(Box);

interface SuggestionsPanelProps {
	roadmapId: string;
}

export function SuggestionsPanel({ roadmapId }: SuggestionsPanelProps) {
	const theme = useTheme();
	const { data: suggestions, isLoading } = useGetSuggestionsQuery(roadmapId);

	if (isLoading || !suggestions || suggestions.length === 0) return null;

	return (
		<Box sx={{ mt: 4 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
				<Box sx={{
					width: 36, height: 36, borderRadius: 2,
					display: 'flex', alignItems: 'center', justifyContent: 'center',
					bgcolor: alpha(theme.palette.secondary.main, 0.12),
					color: theme.palette.secondary.light,
				}}>
					<Compass size={18} />
				</Box>
				<Typography variant='h6' sx={{ fontWeight: 600 }}>
					Related Topics
				</Typography>
			</Box>

			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
				{suggestions.map((suggestion, index) => (
					<MotionBox
						key={suggestion.concept.id}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: index * 0.05 }}>
						<Card variant='glass' sx={{ height: '100%' }}>
							<Card.Content>
								<Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
									{suggestion.concept.name}
								</Typography>
								{suggestion.concept.description && (
									<Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
										{suggestion.concept.description}
									</Typography>
								)}
								<Typography variant='caption' sx={{ color: alpha(theme.palette.secondary.light, 0.8) }}>
									{suggestion.relevance}
								</Typography>
							</Card.Content>
						</Card>
					</MotionBox>
				))}
			</Box>
		</Box>
	);
}
