'use client';

import { useState, useRef, useCallback } from 'react';
import {
	Box,
	Typography,
	CircularProgress,
	Button,
	alpha,
	useTheme,
	Chip,
} from '@mui/material';
import { CheckCircle2, Circle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { useStepQuizCommand } from '@/application/roadmap';
import type {
	StepQuizQuestionDto,
	QuestionResultDto,
} from '@/infrastructure/api/roadmapApi';

type Phase = 'loading' | 'quiz' | 'results';

interface StepQuizModalProps {
	roadmapId: string;
	conceptId: string;
	conceptName: string;
	onClose: () => void;
}

export function StepQuizModal({
	roadmapId,
	conceptId,
	conceptName,
	onClose,
}: StepQuizModalProps) {
	const theme = useTheme();
	const { generate, submit, isGenerating, isSubmitting } = useStepQuizCommand();

	const [phase, setPhase] = useState<Phase>('loading');
	const [attemptId, setAttemptId] = useState<string | null>(null);
	const [questions, setQuestions] = useState<StepQuizQuestionDto[]>([]);
	const [answers, setAnswers] = useState<Record<number, string>>({});
	const [results, setResults] = useState<QuestionResultDto[] | null>(null);
	const [passed, setPassed] = useState(false);
	const [score, setScore] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const loadQuiz = useCallback(async () => {
		setPhase('loading');
		setError(null);
		setAnswers({});
		setResults(null);
		try {
			const data = await generate(roadmapId, conceptId);
			setAttemptId(data.attemptId);
			setQuestions(data.questions);
			setPhase('quiz');
		} catch {
			setError('Failed to generate quiz. Please try again.');
		}
	}, [generate, roadmapId, conceptId]);

	// Auto-load quiz on first render using the null-check ref pattern
	const initRef = useRef<true | null>(null);
	if (initRef.current == null) {
		initRef.current = true;
		loadQuiz();
	}

	const handleSelectAnswer = (questionIndex: number, label: string) => {
		setAnswers((prev) => ({ ...prev, [questionIndex]: label }));
	};

	const allAnswered = questions.length > 0 && questions.every((_, i) => answers[i]);

	const handleSubmit = async () => {
		if (!attemptId) return;
		try {
			const data = await submit(roadmapId, attemptId, answers);
			setPassed(data.passed);
			setScore(data.score);
			setResults(data.results);
			setPhase('results');
		} catch {
			setError('Failed to submit quiz. Please try again.');
		}
	};

	// Loading phase
	if (phase === 'loading') {
		return (
			<Box sx={{ textAlign: 'center', py: 6 }}>
				{error ?
					<>
						<Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
						<Button variant="outlined" onClick={loadQuiz}>Retry</Button>
					</>
				:	<>
						<CircularProgress size={40} sx={{ mb: 2 }} />
						<Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
							Preparing quiz for <strong>{conceptName}</strong>...
						</Typography>
					</>
				}
			</Box>
		);
	}

	// Results phase
	if (phase === 'results' && results) {
		return (
			<Box sx={{ py: 1 }}>
				{/* Pass/Fail Banner */}
				<Box
					sx={{
						textAlign: 'center',
						p: 3,
						mb: 3,
						borderRadius: 3,
						bgcolor: alpha(passed ? theme.palette.success.main : theme.palette.error.main, 0.1),
						border: `1px solid ${alpha(passed ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
					}}>
					{passed ?
						<Trophy size={40} color={theme.palette.success.light} />
					:	<XCircle size={40} color={theme.palette.error.light} />}
					<Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
						{passed ? 'Quiz Passed!' : 'Not Quite...'}
					</Typography>
					<Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
						Score: {score}% ({results.filter((r) => r.isCorrect).length}/{results.length} correct)
					</Typography>
					{passed && (
						<Typography variant="body2" sx={{ color: theme.palette.success.light, mt: 0.5 }}>
							Step marked as completed
						</Typography>
					)}
				</Box>

				{/* Per-question breakdown */}
				{results.map((r) => (
					<Box
						key={r.index}
						sx={{
							mb: 2,
							p: 2,
							borderRadius: 2,
							bgcolor: alpha(theme.palette.background.paper, 0.5),
							border: `1px solid ${alpha(r.isCorrect ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
						}}>
						<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
							{r.isCorrect ?
								<CheckCircle2 size={18} color={theme.palette.success.light} />
							:	<XCircle size={18} color={theme.palette.error.light} />}
							<Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
								{r.text}
							</Typography>
						</Box>
						{!r.isCorrect && (
							<Box sx={{ ml: 3.5 }}>
								<Typography variant="caption" sx={{ color: theme.palette.error.light }}>
									Your answer: {r.selectedAnswer}
								</Typography>
								<Typography variant="caption" display="block" sx={{ color: theme.palette.success.light }}>
									Correct: {r.correctAnswer}
								</Typography>
							</Box>
						)}
						{r.explanation && (
							<Typography
								variant="caption"
								display="block"
								sx={{ ml: 3.5, mt: 0.5, color: theme.palette.text.secondary, fontStyle: 'italic' }}>
								{r.explanation}
							</Typography>
						)}
					</Box>
				))}

				{/* Actions */}
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
					{!passed && (
						<Button
							variant="outlined"
							startIcon={<RotateCcw size={16} />}
							onClick={loadQuiz}
							disabled={isGenerating}>
							Try Again
						</Button>
					)}
					<Button variant="contained" onClick={onClose}>
						Close
					</Button>
				</Box>
			</Box>
		);
	}

	// Quiz phase
	return (
		<Box sx={{ py: 1 }}>
			<Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
				Answer at least 2 out of 3 questions correctly to complete this step.
			</Typography>

			{error && (
				<Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
			)}

			{questions.map((q, qi) => (
				<Box key={qi} sx={{ mb: 3 }}>
					<Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
						{qi + 1}. {q.text}
					</Typography>

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						{q.options.map((opt) => {
							const isSelected = answers[qi] === opt.label;
							return (
								<Box
									key={opt.label}
									onClick={() => handleSelectAnswer(qi, opt.label)}
									sx={{
										p: 1.5,
										borderRadius: 2,
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										gap: 1.5,
										border: `1px solid ${alpha(
											isSelected ? theme.palette.primary.main : theme.palette.divider,
											isSelected ? 0.5 : 0.2,
										)}`,
										bgcolor: alpha(
											isSelected ? theme.palette.primary.main : theme.palette.background.paper,
											isSelected ? 0.1 : 0.3,
										),
										transition: 'all 0.15s ease',
										'&:hover': {
											bgcolor: alpha(theme.palette.primary.main, 0.08),
											borderColor: alpha(theme.palette.primary.main, 0.3),
										},
									}}>
									{isSelected ?
									<CheckCircle2
										size={18}
										color={theme.palette.primary.light}
										style={{ flexShrink: 0 }}
									/>
								:	<Circle
										size={18}
										color={alpha(theme.palette.text.secondary, 0.4)}
										style={{ flexShrink: 0 }}
									/>
								}
									<Chip
										label={opt.label}
										size="small"
										sx={{
											minWidth: 28,
											height: 24,
											fontWeight: 700,
											fontSize: '0.7rem',
											bgcolor: isSelected
												? alpha(theme.palette.primary.main, 0.2)
												: alpha(theme.palette.text.secondary, 0.1),
											color: isSelected
												? theme.palette.primary.light
												: theme.palette.text.secondary,
										}}
									/>
									<Typography variant="body2" sx={{ flex: 1 }}>{opt.text}</Typography>
								</Box>
							);
						})}
					</Box>
				</Box>
			))}

			<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
				<Button variant="outlined" onClick={onClose}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={!allAnswered || isSubmitting}>
					{isSubmitting ? <CircularProgress size={20} /> : 'Submit'}
				</Button>
			</Box>
		</Box>
	);
}
