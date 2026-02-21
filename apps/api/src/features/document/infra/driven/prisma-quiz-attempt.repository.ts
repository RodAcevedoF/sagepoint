import type { IQuizAttemptRepository } from '@sagepoint/domain';
import { QuizAttempt } from '@sagepoint/domain';
import type { QuizAttempt as PrismaQuizAttempt } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

export class PrismaQuizAttemptRepository implements IQuizAttemptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(attempt: QuizAttempt): Promise<void> {
    await this.prisma.quizAttempt.create({
      data: {
        id: attempt.id,
        quizId: attempt.quizId,
        userId: attempt.userId,
        answers: attempt.answers,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        completedAt: attempt.completedAt,
        createdAt: attempt.createdAt,
      },
    });
  }

  async findByUserAndQuiz(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt[]> {
    const data = await this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { createdAt: 'desc' },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async findByUser(userId: string): Promise<QuizAttempt[]> {
    const data = await this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  private mapToDomain(data: PrismaQuizAttempt): QuizAttempt {
    return new QuizAttempt(
      data.id,
      data.quizId,
      data.userId,
      data.answers as Record<string, string>,
      data.score,
      data.totalQuestions,
      data.correctAnswers,
      data.createdAt,
      data.completedAt ?? undefined,
    );
  }
}
