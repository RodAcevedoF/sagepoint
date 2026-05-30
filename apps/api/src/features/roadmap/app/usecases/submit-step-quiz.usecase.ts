import type { IStepQuizAttemptRepository } from '@sagepoint/domain';
import { ReviewSource, StepQuizAttempt, StepStatus } from '@sagepoint/domain';
import { Logger } from '@nestjs/common';
import { UpdateStepProgressUseCase } from './update-step-progress.usecase';
import { ScheduleReviewUseCase } from '@/features/review/app/usecases/schedule-review.usecase';

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
const QUALITY_CORRECT = 4;
const QUALITY_INCORRECT = 1;

export class SubmitStepQuizUseCase {
  private readonly logger = new Logger(SubmitStepQuizUseCase.name);

  constructor(
    private readonly stepQuizAttemptRepository: IStepQuizAttemptRepository,
    private readonly updateStepProgressUseCase: UpdateStepProgressUseCase,
    private readonly scheduleReviewUseCase: ScheduleReviewUseCase,
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

    await this.scheduleReviewsBestEffort(
      command.userId,
      attempt.conceptId,
      attempt.questions,
      results,
      updatedAttempt.completedAt!,
    );

    return { passed, score, totalQuestions, correctAnswers, results };
  }

  private async scheduleReviewsBestEffort(
    userId: string,
    conceptId: string,
    questions: StepQuizAttempt['questions'],
    results: QuestionResult[],
    now: Date,
  ): Promise<void> {
    await Promise.all(
      results.map(async (result) => {
        const question = questions[result.index];
        if (!question?.id) return; // pre-id-migration attempts skip SR
        try {
          await this.scheduleReviewUseCase.execute({
            userId,
            source: ReviewSource.ROADMAP_STEP,
            sourceId: conceptId,
            questionId: question.id,
            quality: result.isCorrect ? QUALITY_CORRECT : QUALITY_INCORRECT,
            now,
          });
        } catch (error) {
          this.logger.warn(
            `Failed to schedule review for question ${question.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }),
    );
  }
}
