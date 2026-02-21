'use client';

import { Box, Typography, alpha, useTheme } from '@mui/material';
import { Brain } from 'lucide-react';
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
				<Card.Content>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Box
							sx={{
								width: 40,
								height: 40,
								borderRadius: 2,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								bgcolor: alpha(theme.palette.info.main, 0.1),
								color: theme.palette.info.light,
							}}>
							<Brain size={20} />
						</Box>
						<Box>
							<Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
								{quiz.title}
							</Typography>
							<Typography variant='caption' color='text.secondary'>
								{quiz.questionCount} questions
							</Typography>
						</Box>
					</Box>
				</Card.Content>
			</Card>
		</MotionBox>
	);
}
