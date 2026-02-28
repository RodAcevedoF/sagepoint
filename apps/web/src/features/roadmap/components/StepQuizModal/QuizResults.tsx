import { Box, Typography, Button, Chip, useTheme } from '@mui/material';
import {
	CheckCircle2,
	XCircle,
	Trophy,
	RotateCcw,
	Lightbulb,
} from 'lucide-react';
import type {
	StepQuizQuestionDto,
	QuestionResultDto,
} from '@/infrastructure/api/roadmapApi';
import type { Styles } from './StepQuizModal.styles';

interface QuizResultsProps {
	passed: boolean;
	score: number;
	results: QuestionResultDto[];
	questions: StepQuizQuestionDto[];
	isGenerating: boolean;
	onRetry: () => void;
	onClose: () => void;
	styles: Styles;
}

export function QuizResults({
	passed,
	score,
	results,
	questions,
	isGenerating,
	onRetry,
	onClose,
	styles,
}: QuizResultsProps) {
	const theme = useTheme();

	return (
		<Box sx={{ py: 1 }}>
			<Box sx={styles.resultsBanner(passed)}>
				{passed ?
					<Trophy size={40} color={theme.palette.success.light} />
				:	<XCircle size={40} color={theme.palette.error.light} />}
				<Typography variant='h6' sx={{ mt: 1, fontWeight: 700 }}>
					{passed ? 'Quiz Passed!' : 'Not Quite...'}
				</Typography>
				<Typography
					variant='body2'
					sx={{ color: theme.palette.text.secondary }}>
					Score: {score}% ({results.filter((r) => r.isCorrect).length}/
					{results.length} correct)
				</Typography>
				{passed && (
					<Typography
						variant='body2'
						sx={{ color: theme.palette.success.light, mt: 0.5 }}>
						Step marked as completed
					</Typography>
				)}
			</Box>

			{results.map((r) => {
				const question = questions[r.index];
				return (
					<Box key={r.index} sx={styles.questionCard(r.isCorrect)}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'flex-start',
								gap: 1,
								mb: 1.5,
							}}>
							{r.isCorrect ?
								<CheckCircle2
									size={18}
									color={theme.palette.success.light}
									style={{ flexShrink: 0, marginTop: 2 }}
								/>
							:	<XCircle
									size={18}
									color={theme.palette.error.light}
									style={{ flexShrink: 0, marginTop: 2 }}
								/>
							}
							<Typography variant='body2' sx={{ fontWeight: 600, flex: 1 }}>
								{r.index + 1}. {r.text}
							</Typography>
						</Box>

						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 0.75,
								mb: 1.5,
							}}>
							{question?.options.map((opt) => {
								const isCorrectOption = opt.label === r.correctAnswer;
								const isUserSelection = opt.label === r.selectedAnswer;
								const isWrongSelection = isUserSelection && !r.isCorrect;

								return (
									<Box
										key={opt.label}
										sx={styles.optionCard(
											isUserSelection,
											isCorrectOption,
											isWrongSelection,
										)}>
										<Chip
											label={opt.label}
											size='small'
											sx={styles.optionChip(
												isUserSelection,
												isCorrectOption,
												isWrongSelection,
											)}
										/>
										<Typography
											variant='body2'
											sx={{
												flex: 1,
												color:
													isCorrectOption ? theme.palette.success.light
													: isWrongSelection ? theme.palette.error.light
													: theme.palette.text.primary,
											}}>
											{opt.text}
										</Typography>
										{isCorrectOption && (
											<CheckCircle2
												size={16}
												color={theme.palette.success.light}
											/>
										)}
										{isWrongSelection && (
											<XCircle size={16} color={theme.palette.error.light} />
										)}
									</Box>
								);
							})}
						</Box>

						{r.explanation && (
							<Box sx={styles.explanationBox}>
								<Lightbulb
									size={16}
									color={theme.palette.info.light}
									style={{ flexShrink: 0, marginTop: 2 }}
								/>
								<Typography
									variant='caption'
									sx={{ color: theme.palette.text.secondary }}>
									{r.explanation}
								</Typography>
							</Box>
						)}
					</Box>
				);
			})}

			<Box
				sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
				{!passed && (
					<Button
						variant='outlined'
						startIcon={<RotateCcw size={16} />}
						onClick={onRetry}
						disabled={isGenerating}>
						Try Again
					</Button>
				)}
				<Button variant='contained' onClick={onClose}>
					Close
				</Button>
			</Box>
		</Box>
	);
}
