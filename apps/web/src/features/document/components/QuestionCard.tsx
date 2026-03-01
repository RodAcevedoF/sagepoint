'use client';

import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { CheckCircle2, Circle, Lightbulb } from 'lucide-react';
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
			<Card.Content sx={{ p: { xs: 2.5, md: 3 } }}>
				<Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2.5 }}>
					{question.order + 1}. {question.text}
				</Typography>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
					{question.options.map((option) => {
						const isSelected = selectedAnswer === option.label;
						const isCorrect = showResult && option.isCorrect;
						const isWrong = showResult && isSelected && !option.isCorrect;

						let borderColor = alpha(theme.palette.divider, 0.2);
						let bgColor = alpha(theme.palette.background.paper, 0.3);

						if (isCorrect) {
							borderColor = alpha(theme.palette.success.main, 0.4);
							bgColor = alpha(theme.palette.success.main, 0.06);
						} else if (isWrong) {
							borderColor = alpha(theme.palette.error.main, 0.4);
							bgColor = alpha(theme.palette.error.main, 0.06);
						} else if (isSelected) {
							borderColor = alpha(theme.palette.primary.main, 0.5);
							bgColor = alpha(theme.palette.primary.main, 0.1);
						}

						return (
							<Box
								key={option.label}
								onClick={() => !showResult && onAnswer(question.id, option.label)}
								sx={{
									p: 1.5,
									borderRadius: 2,
									cursor: showResult ? 'default' : 'pointer',
									display: 'flex',
									alignItems: 'center',
									gap: 1.5,
									border: `1px solid ${borderColor}`,
									bgcolor: bgColor,
									transition: 'all 0.15s ease',
									...(!showResult && {
										'&:hover': {
											bgcolor: alpha(theme.palette.primary.main, 0.08),
											borderColor: alpha(theme.palette.primary.main, 0.3),
										},
									}),
								}}>
								{showResult ?
									isCorrect ?
										<CheckCircle2 size={18} color={theme.palette.success.light} style={{ flexShrink: 0 }} />
									:	isWrong ?
										<CheckCircle2 size={18} color={theme.palette.error.light} style={{ flexShrink: 0 }} />
									:	<Circle size={18} color={alpha(theme.palette.text.secondary, 0.3)} style={{ flexShrink: 0 }} />
								: isSelected ?
									<CheckCircle2 size={18} color={theme.palette.primary.light} style={{ flexShrink: 0 }} />
								:	<Circle size={18} color={alpha(theme.palette.text.secondary, 0.4)} style={{ flexShrink: 0 }} />
								}
								<Chip
									label={option.label}
									size='small'
									sx={{
										minWidth: 28,
										height: 24,
										fontWeight: 700,
										fontSize: '0.7rem',
										bgcolor:
											isCorrect ? alpha(theme.palette.success.main, 0.2)
											: isWrong ? alpha(theme.palette.error.main, 0.2)
											: isSelected ? alpha(theme.palette.primary.main, 0.2)
											: alpha(theme.palette.text.secondary, 0.1),
										color:
											isCorrect ? theme.palette.success.light
											: isWrong ? theme.palette.error.light
											: isSelected ? theme.palette.primary.light
											: theme.palette.text.secondary,
									}}
								/>
								<Typography variant='body2' sx={{ flex: 1 }}>
									{option.text}
								</Typography>
							</Box>
						);
					})}
				</Box>

				{showResult && question.explanation && (
					<Box
						sx={{
							display: 'flex',
							gap: 1,
							mt: 2,
							p: 1.5,
							borderRadius: 1.5,
							bgcolor: alpha(theme.palette.info.main, 0.06),
							border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
						}}>
						<Lightbulb size={16} color={theme.palette.info.light} style={{ flexShrink: 0, marginTop: 2 }} />
						<Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
							{question.explanation}
						</Typography>
					</Box>
				)}
			</Card.Content>
		</Card>
	);
}
