'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Send } from 'lucide-react';
import { Loader, EmptyState, Button } from '@/common/components';
import { ButtonSizes, ButtonIconPositions } from '@/common/types';
import { useQuizQuestionsQuery, useSubmitQuizAttemptCommand } from '@/application/document';
import { QuestionCard } from './QuestionCard';
import { QuizResults } from './QuizResults';
import type { QuizAttemptDto } from '@/infrastructure/api/documentApi';

interface QuizViewProps {
	documentId: string;
	quizId: string;
}

export function QuizView({ documentId, quizId }: QuizViewProps) {
	const { data, isLoading } = useQuizQuestionsQuery(documentId, quizId);
	const { execute: submitAttempt, isLoading: submitting } = useSubmitQuizAttemptCommand();
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [result, setResult] = useState<QuizAttemptDto | null>(null);

	const handleAnswer = (questionId: string, answer: string) => {
		setAnswers((prev) => ({ ...prev, [questionId]: answer }));
	};

	const handleSubmit = async () => {
		try {
			const attempt = await submitAttempt(documentId, quizId, answers);
			setResult(attempt);
		} catch {
			// Error handled by command hook
		}
	};

	const handleRetry = () => {
		setAnswers({});
		setResult(null);
	};

	if (isLoading) {
		return <Loader variant='page' message='Loading quiz' />;
	}

	if (!data) {
		return <EmptyState title='Quiz not found' />;
	}

	const { quiz, questions } = data;
	const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Typography variant='h4' sx={{ fontWeight: 700 }}>
				{quiz.title}
			</Typography>
			{quiz.description && (
				<Typography variant='body1' color='text.secondary'>
					{quiz.description}
				</Typography>
			)}

			{result ? (
				<QuizResults attempt={result} onRetry={handleRetry} />
			) : (
				<>
					{questions.map((question) => (
						<QuestionCard
							key={question.id}
							question={question}
							selectedAnswer={answers[question.id]}
							onAnswer={handleAnswer}
						/>
					))}

					{questions.length > 0 && (
						<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								label={submitting ? 'Submitting...' : 'Submit Answers'}
								icon={Send}
								iconPos={ButtonIconPositions.START}
								size={ButtonSizes.LARGE}
								onClick={handleSubmit}
								disabled={!allAnswered || submitting}
							/>
						</Box>
					)}
				</>
			)}
		</Box>
	);
}
