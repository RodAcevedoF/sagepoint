'use client';

import { Typography, Radio, RadioGroup, FormControlLabel, alpha, useTheme } from '@mui/material';
import { Card } from '@/common/components';
import type { QuestionDto } from '@/infrastructure/api/documentApi';

interface QuestionCardProps {
	question: QuestionDto;
	selectedAnswer?: string;
	onAnswer: (questionId: string, answer: string) => void;
	showResult?: boolean;
}

export function QuestionCard({ question, selectedAnswer, onAnswer, showResult }: QuestionCardProps) {
	const theme = useTheme();

	return (
		<Card variant='outlined'>
			<Card.Content>
				<Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
					{question.order + 1}. {question.text}
				</Typography>

				<RadioGroup
					value={selectedAnswer ?? ''}
					onChange={(e) => onAnswer(question.id, e.target.value)}>
					{question.options.map((option) => {
						let sx = {};
						if (showResult && option.label === selectedAnswer) {
							sx = option.isCorrect
								? { bgcolor: alpha(theme.palette.success.main, 0.1) }
								: { bgcolor: alpha(theme.palette.error.main, 0.1) };
						}
						if (showResult && option.isCorrect) {
							sx = { ...sx, bgcolor: alpha(theme.palette.success.main, 0.1) };
						}

						return (
							<FormControlLabel
								key={option.label}
								value={option.label}
								control={<Radio disabled={showResult} />}
								label={`${option.label}. ${option.text}`}
								sx={{ borderRadius: 2, px: 1, ...sx }}
							/>
						);
					})}
				</RadioGroup>

				{showResult && question.explanation && (
					<Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
						{question.explanation}
					</Typography>
				)}
			</Card.Content>
		</Card>
	);
}
