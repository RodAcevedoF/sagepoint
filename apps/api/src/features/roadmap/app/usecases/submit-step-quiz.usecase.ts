import type { IStepQuizAttemptRepository } from '@sagepoint/domain';
import { StepQuizAttempt } from '@sagepoint/domain';
import { UpdateStepProgressUseCase } from './update-step-progress.usecase';
import { StepStatus } from '@sagepoint/domain';

export interface SubmitStepQuizCommand {
  userId: string;
  attemptId: string;
  answers: Record<number, string>; // questionIndex -> selected option label
}

export interface QuestionResult {
  index: number;
  text: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface SubmitStepQuizResult {
  passed: boolean;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  results: QuestionResult[];
}

const PASS_THRESHOLD = 2; // Need at least 2/3 correct

export class SubmitStepQuizUseCase {
  constructor(
    private readonly stepQuizAttemptRepository: IStepQuizAttemptRepository,
    private readonly updateStepProgressUseCase: UpdateStepProgressUseCase,
  ) {}

  async execute(command: SubmitStepQuizCommand): Promise<SubmitStepQuizResult> {
    const attempt = await this.stepQuizAttemptRepository.findById(
      command.attemptId,
    );
    if (!attempt) {
      throw new Error(`Quiz attempt ${command.attemptId} not found`);
    }

    if (attempt.userId !== command.userId) {
      throw new Error(
        'Unauthorized: quiz attempt does not belong to this user',
      );
    }

    if (attempt.completedAt) {
      throw new Error('Quiz attempt has already been submitted');
    }

    // Grade each question
    const results: QuestionResult[] = attempt.questions.map((q, i) => {
      const selectedLabel = command.answers[i] ?? '';
      const correctOption = q.options.find((o) => o.isCorrect);
      const correctLabel = correctOption?.label ?? '';
      const isCorrect = selectedLabel === correctLabel;

      return {
        index: i,
        text: q.text,
        selectedAnswer: selectedLabel,
        correctAnswer: correctLabel,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const totalQuestions = attempt.totalQuestions;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = correctAnswers >= PASS_THRESHOLD;

    // Update attempt
    const updatedAttempt = new StepQuizAttempt({
      ...attempt,
      answers: command.answers,
      score,
      correctAnswers,
      passed,
      completedAt: new Date(),
    });

    await this.stepQuizAttemptRepository.update(updatedAttempt);

    // If passed, mark step as COMPLETED
    if (passed) {
      await this.updateStepProgressUseCase.execute({
        userId: command.userId,
        roadmapId: attempt.roadmapId,
        conceptId: attempt.conceptId,
        status: StepStatus.COMPLETED,
      });
    }

    return { passed, score, totalQuestions, correctAnswers, results };
  }
}
