import {
	Box,
	Typography,
	CircularProgress,
	Button,
	Chip,
	alpha,
	useTheme,
} from '@mui/material';
import { CheckCircle2, Circle } from 'lucide-react';
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

	return (
		<Box sx={{ py: 1 }}>
			<Typography
				variant='body2'
				sx={{ color: theme.palette.text.secondary, mb: 3 }}>
				Answer at least 2 out of 3 questions correctly to complete this step.
			</Typography>

			{error && (
				<Typography color='error' sx={{ mb: 2, textAlign: 'center' }}>
					{error}
				</Typography>
			)}

			{questions.map((q, qi) => (
				<Box key={qi} sx={{ mb: 3 }}>
					<Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5 }}>
						{qi + 1}. {q.text}
					</Typography>

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
				<Button variant='outlined' onClick={onClose} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button
					variant='contained'
					onClick={onSubmit}
					disabled={!allAnswered || isSubmitting}>
					{isSubmitting ?
						<CircularProgress size={20} color='inherit' />
					:	'Submit'}
				</Button>
			</Box>
		</Box>
	);
}
