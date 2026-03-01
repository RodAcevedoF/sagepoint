'use client';

import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { Brain, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/common/components';
import type { QuizDto } from '@/infrastructure/api/documentApi';

const MotionBox = motion.create(Box);

interface QuizCardProps {
	documentId: string;
	quiz: QuizDto;
}

export function QuizCard({ documentId, quiz }: QuizCardProps) {
	const theme = useTheme();
	const router = useRouter();

	return (
		<MotionBox
			whileHover={{ y: -2 }}
			transition={{ duration: 0.2 }}
			onClick={() => router.push(`/documents/${documentId}/quiz/${quiz.id}`)}
			sx={{ cursor: 'pointer' }}>
			<Card variant='outlined'>
				<Card.Content sx={{ p: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Box
							sx={{
								width: 44,
								height: 44,
								borderRadius: 2.5,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								bgcolor: alpha(theme.palette.info.main, 0.1),
								color: theme.palette.info.light,
								flexShrink: 0,
							}}>
							<Brain size={22} />
						</Box>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
								{quiz.title}
							</Typography>
							<Chip
								label={`${quiz.questionCount} questions`}
								size='small'
								sx={{
									mt: 0.5,
									height: 22,
									fontSize: '0.7rem',
									fontWeight: 600,
									bgcolor: alpha(theme.palette.info.main, 0.08),
									color: theme.palette.info.light,
								}}
							/>
						</Box>
						<ArrowRight
							size={20}
							color={alpha(theme.palette.text.secondary, 0.5)}
						/>
					</Box>
				</Card.Content>
			</Card>
		</MotionBox>
	);
}
