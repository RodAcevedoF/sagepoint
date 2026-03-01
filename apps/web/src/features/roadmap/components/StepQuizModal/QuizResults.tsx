import { Box, Typography, Chip, useTheme } from '@mui/material';
import {
	CheckCircle2,
	XCircle,
	Trophy,
	RotateCcw,
	Lightbulb,
	X,
} from 'lucide-react';
import { Button } from '@/common/components';
import { ButtonVariants, ButtonSizes, ButtonIconPositions } from '@/common/types';
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
	const correctCount = results.filter((r) => r.isCorrect).length;

	return (
		<Box sx={{ py: 1 }}>
			<Box sx={styles.resultsBanner(passed)}>
				{passed ?
					<Trophy size={44} color={theme.palette.success.light} />
				:	<XCircle size={44} color={theme.palette.error.light} />}
				<Typography variant='h6' sx={{ mt: 1, fontWeight: 700 }}>
					{passed ? 'Quiz Passed!' : 'Not Quite...'}
				</Typography>
				<Typography variant='h4' sx={styles.resultScore}>
					{score}%
				</Typography>
				<Typography variant='body2' sx={styles.resultSubtext}>
					{correctCount}/{results.length} correct
				</Typography>
				{passed && (
					<Typography variant='body2' sx={styles.resultPassedNote}>
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
						label='Try Again'
						icon={RotateCcw}
						iconPos={ButtonIconPositions.START}
						variant={ButtonVariants.OUTLINED}
						size={ButtonSizes.MEDIUM}
						onClick={onRetry}
						disabled={isGenerating}
						loading={isGenerating}
					/>
				)}
				<Button
					label='Close'
					icon={X}
					iconPos={ButtonIconPositions.START}
					size={ButtonSizes.MEDIUM}
					onClick={onClose}
				/>
			</Box>
		</Box>
	);
}
