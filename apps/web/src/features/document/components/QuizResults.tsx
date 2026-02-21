'use client';

import { Box, Typography, alpha, useTheme } from '@mui/material';
import { Trophy, RotateCcw } from 'lucide-react';
import { Card, Button } from '@/common/components';
import { ButtonIconPositions, ButtonSizes } from '@/common/types';
import type { QuizAttemptDto } from '@/infrastructure/api/documentApi';

interface QuizResultsProps {
	attempt: QuizAttemptDto;
	onRetry?: () => void;
}

export function QuizResults({ attempt, onRetry }: QuizResultsProps) {
	const theme = useTheme();
	const isPassing = attempt.score >= 70;

	return (
		<Card variant='glass'>
			<Card.Content>
				<Box sx={{ textAlign: 'center', py: 3 }}>
					<Box
						sx={{
							width: 80,
							height: 80,
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							bgcolor: alpha(
								isPassing ? theme.palette.success.main : theme.palette.warning.main,
								0.1,
							),
							color: isPassing ? theme.palette.success.light : theme.palette.warning.light,
							mx: 'auto',
							mb: 2,
						}}>
						<Trophy size={40} />
					</Box>

					<Typography variant='h3' sx={{ fontWeight: 800, mb: 0.5 }}>
						{Math.round(attempt.score)}%
					</Typography>
					<Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
						{attempt.correctAnswers} of {attempt.totalQuestions} correct
					</Typography>
					<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
						{isPassing ? 'Great job!' : 'Keep practicing!'}
					</Typography>

					{onRetry && (
						<Button
							label='Try Again'
							icon={RotateCcw}
							iconPos={ButtonIconPositions.START}
							size={ButtonSizes.MEDIUM}
							onClick={onRetry}
						/>
					)}
				</Box>
			</Card.Content>
		</Card>
	);
}
