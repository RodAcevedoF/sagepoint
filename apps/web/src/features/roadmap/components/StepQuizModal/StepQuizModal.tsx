import { useState, useRef, useCallback } from 'react';
import { useTheme } from '@mui/material';
import { useStepQuizCommand } from '@/application/roadmap';
import type {
	StepQuizQuestionDto,
	QuestionResultDto,
} from '@/infrastructure/api/roadmapApi';
import { Loader } from '@/common/components/Loader';
import { ErrorState } from '@/common/components/States';
import { makeStyles } from './StepQuizModal.styles';
import { QuizQuestions } from './QuizQuestions';
import { QuizResults } from './QuizResults';

type Phase = 'loading' | 'quiz' | 'results';

interface PreGeneratedQuiz {
	attemptId: string;
	questions: StepQuizQuestionDto[];
}

interface StepQuizModalProps {
	roadmapId: string;
	conceptId: string;
	conceptName: string;
	preGeneratedQuiz?: PreGeneratedQuiz | null;
	onClose: () => void;
}

interface QuizState {
	phase: Phase;
	attemptId: string | null;
	questions: StepQuizQuestionDto[];
	answers: Record<number, string>;
	results: QuestionResultDto[] | null;
	passed: boolean;
	score: number;
	error: string | null;
}

const INITIAL_STATE: QuizState = {
	phase: 'loading',
	attemptId: null,
	questions: [],
	answers: {},
	results: null,
	passed: false,
	score: 0,
	error: null,
};

export function StepQuizModal({
	roadmapId,
	conceptId,
	conceptName,
	preGeneratedQuiz,
	onClose,
}: StepQuizModalProps) {
	const theme = useTheme();
	const styles = makeStyles(theme);
	const { generate, submit, isGenerating, isSubmitting } =
		useStepQuizCommand();

	const [state, setState] = useState<QuizState>(() =>
		preGeneratedQuiz
			? {
					...INITIAL_STATE,
					phase: 'quiz',
					attemptId: preGeneratedQuiz.attemptId,
					questions: preGeneratedQuiz.questions,
				}
			: INITIAL_STATE,
	);

	const loadQuiz = useCallback(async () => {
		setState((prev) => ({
			...prev,
			phase: 'loading',
			error: null,
			answers: {},
			results: null,
		}));
		try {
			const data = await generate(roadmapId, conceptId);
			setState((prev) => ({
				...prev,
				phase: 'quiz',
				attemptId: data.attemptId,
				questions: data.questions,
			}));
		} catch {
			setState((prev) => ({
				...prev,
				phase: 'loading',
				error: 'Failed to generate quiz. Please try again.',
			}));
		}
	}, [generate, roadmapId, conceptId]);

	// Auto-load quiz on first render (ref avoids double-fire in StrictMode)
	// Skip if pre-generated quiz was provided
	const initRef = useRef<boolean | null>(null);
	if (initRef.current === null) {
		initRef.current = true;
		if (!preGeneratedQuiz) {
			loadQuiz();
		}
	}

	const handleSelectAnswer = (questionIndex: number, label: string) => {
		setState((prev) => ({
			...prev,
			answers: { ...prev.answers, [questionIndex]: label },
		}));
	};

	const handleSubmit = async () => {
		if (!state.attemptId) return;
		try {
			const data = await submit(roadmapId, state.attemptId, state.answers);
			setState((prev) => ({
				...prev,
				phase: 'results',
				passed: data.passed,
				score: data.score,
				results: data.results,
			}));
		} catch {
			setState((prev) => ({
				...prev,
				error: 'Failed to submit quiz. Please try again.',
			}));
		}
	};

	const allAnswered =
		state.questions.length > 0 &&
		state.questions.every((_, i) => state.answers[i] !== undefined);

	if (state.error && state.phase === 'loading') {
		return (
			<ErrorState
				title='Quiz unavailable'
				description={state.error}
				onRetry={loadQuiz}
			/>
		);
	}

	if (state.phase === 'loading') {
		return (
			<Loader
				variant='circular'
				message={`Preparing quiz for ${conceptName}...`}
				sx={{ py: 6 }}
			/>
		);
	}

	if (state.phase === 'results' && state.results) {
		return (
			<QuizResults
				passed={state.passed}
				score={state.score}
				results={state.results}
				questions={state.questions}
				isGenerating={isGenerating}
				onRetry={loadQuiz}
				onClose={onClose}
				styles={styles}
			/>
		);
	}

	return (
		<QuizQuestions
			questions={state.questions}
			answers={state.answers}
			error={state.error}
			isSubmitting={isSubmitting}
			allAnswered={allAnswered}
			onSelectAnswer={handleSelectAnswer}
			onSubmit={handleSubmit}
			onClose={onClose}
			styles={styles}
		/>
	);
}
