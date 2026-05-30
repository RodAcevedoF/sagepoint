import {
  QuizAttempt,
  ReviewSource,
  type IQuizAttemptRepository,
  type IQuestionRepository,
} from '@sagepoint/domain';
import { Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ScheduleReviewUseCase } from '@/features/review/app/usecases/schedule-review.usecase';

export interface SubmitQuizAttemptCommand {
  quizId: string;
  userId: string;
  answers: Record<string, string>;
}

const QUALITY_CORRECT = 4;
const QUALITY_INCORRECT = 1;

export class SubmitQuizAttemptUseCase {
  private readonly logger = new Logger(SubmitQuizAttemptUseCase.name);

  constructor(
    private readonly questionRepository: IQuestionRepository,
    private readonly attemptRepository: IQuizAttemptRepository,
    private readonly scheduleReviewUseCase: ScheduleReviewUseCase,
  ) {}

  async execute(command: SubmitQuizAttemptCommand): Promise<QuizAttempt> {
    const questions = await this.questionRepository.findByQuizId(
      command.quizId,
    );
    if (questions.length === 0) {
      throw new NotFoundException(
        `No questions found for quiz ${command.quizId}`,
      );
    }

    let correctAnswers = 0;
    const perQuestionQuality: { questionId: string; quality: number }[] = [];
    for (const question of questions) {
      const userAnswer = command.answers[question.id];
      const correctOption = question.options.find((o) => o.isCorrect);
      const isCorrect = !!correctOption && userAnswer === correctOption.label;
      if (isCorrect) correctAnswers++;
      perQuestionQuality.push({
        questionId: question.id,
        quality: isCorrect ? QUALITY_CORRECT : QUALITY_INCORRECT,
      });
    }

    const score =
      questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;

    const now = new Date();
    const attempt = new QuizAttempt(
      randomUUID(),
      command.quizId,
      command.userId,
      command.answers,
      score,
      questions.length,
      correctAnswers,
      now,
      now,
    );

    await this.attemptRepository.save(attempt);

    await this.scheduleReviewsBestEffort(
      command.userId,
      command.quizId,
      perQuestionQuality,
      now,
    );

    return attempt;
  }

  private async scheduleReviewsBestEffort(
    userId: string,
    quizId: string,
    items: { questionId: string; quality: number }[],
    now: Date,
  ): Promise<void> {
    await Promise.all(
      items.map(async ({ questionId, quality }) => {
        try {
          await this.scheduleReviewUseCase.execute({
            userId,
            source: ReviewSource.DOCUMENT,
            sourceId: quizId,
            questionId,
            quality,
            now,
          });
        } catch (error) {
          this.logger.warn(
            `Failed to schedule review for question ${questionId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }),
    );
  }
}
