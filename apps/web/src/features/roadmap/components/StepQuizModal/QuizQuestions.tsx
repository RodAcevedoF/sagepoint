import {
	Box,
	Typography,
	Chip,
	alpha,
	useTheme,
} from '@mui/material';
import { CheckCircle2, Circle, Info, Send, X } from 'lucide-react';
import { Button } from '@/common/components';
import { ButtonVariants, ButtonSizes, ButtonIconPositions } from '@/common/types';
import type { StepQuizQuestionDto } from '@/infrastructure/api/roadmapApi';
import type { Styles } from './StepQuizModal.styles';

interface QuizQuestionsProps {
	questions: StepQuizQuestionDto[];
	answers: Record<number, string>;
	error: string | null;
	isSubmitting: boolean;
	allAnswered: boolean;
	onSelectAnswer: (questionIndex: number, label: string) => void;
	onSubmit: () => void;
	onClose: () => void;
	styles: Styles;
}

export function QuizQuestions({
	questions,
	answers,
	error,
	isSubmitting,
	allAnswered,
	onSelectAnswer,
	onSubmit,
	onClose,
	styles,
}: QuizQuestionsProps) {
	const theme = useTheme();
	const answeredCount = Object.keys(answers).length;

	return (
		<Box sx={{ py: 1 }}>
			{/* Info callout with progress */}
			<Box sx={styles.infoCallout}>
				<Box sx={styles.infoCalloutText}>
					<Info size={16} color={theme.palette.info.light} style={{ flexShrink: 0 }} />
					<Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
						Answer at least 2 out of 3 correctly to complete this step.
					</Typography>
				</Box>
				<Chip
					label={`${answeredCount}/${questions.length}`}
					size='small'
					sx={styles.progressChip}
				/>
			</Box>

			{error && (
				<Typography color='error' sx={{ mb: 2, textAlign: 'center' }}>
					{error}
				</Typography>
			)}

			{questions.map((q, qi) => (
				<Box key={qi} sx={styles.questionWrapper}>
					<Box sx={styles.questionHeader}>
						<Box sx={styles.questionBadge}>
							{qi + 1}
						</Box>
						<Typography variant='body2' sx={{ fontWeight: 600, flex: 1, pt: 0.25 }}>
							{q.text}
						</Typography>
					</Box>

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						{q.options.map((opt) => {
							const isSelected = answers[qi] === opt.label;
							return (
								<Box
									key={opt.label}
									onClick={() => onSelectAnswer(qi, opt.label)}
									sx={styles.optionCard(isSelected)}>
									{isSelected ?
										<CheckCircle2
											size={18}
											color={theme.palette.primary.light}
										/>
									:	<Circle
											size={18}
											color={alpha(theme.palette.text.secondary, 0.4)}
										/>
									}
									<Chip
										label={opt.label}
										size='small'
										sx={styles.optionChip(isSelected)}
									/>
									<Typography variant='body2' sx={{ flex: 1 }}>
										{opt.text}
									</Typography>
								</Box>
							);
						})}
					</Box>
				</Box>
			))}

			<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
				<Button
					label='Cancel'
					icon={X}
					iconPos={ButtonIconPositions.START}
					variant={ButtonVariants.OUTLINED}
					size={ButtonSizes.MEDIUM}
					onClick={onClose}
					disabled={isSubmitting}
				/>
				<Button
					label={isSubmitting ? 'Submitting...' : 'Submit'}
					icon={Send}
					iconPos={ButtonIconPositions.START}
					size={ButtonSizes.MEDIUM}
					onClick={onSubmit}
					disabled={!allAnswered || isSubmitting}
					loading={isSubmitting}
				/>
			</Box>
		</Box>
	);
}
