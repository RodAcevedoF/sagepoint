import type { StepQuizAttempt as PrismaAttempt } from '@sagepoint/database';
import { Prisma } from '@sagepoint/database';
import {
  StepQuizAttempt,
  type IStepQuizAttemptRepository,
  type StepQuizQuestion,
} from '@sagepoint/domain';
import { PrismaService } from '@/core/infra/database/prisma.service';

export class PrismaStepQuizAttemptRepository implements IStepQuizAttemptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(attempt: StepQuizAttempt): Promise<StepQuizAttempt> {
    const data = await this.prisma.stepQuizAttempt.create({
      data: {
        id: attempt.id,
        userId: attempt.userId,
        roadmapId: attempt.roadmapId,
        conceptId: attempt.conceptId,
        questions: attempt.questions as unknown as Prisma.InputJsonValue,
        answers:
          (attempt.answers as unknown as Prisma.InputJsonValue) ??
          Prisma.JsonNull,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        passed: attempt.passed,
        completedAt: attempt.completedAt ?? undefined,
      },
    });
    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<StepQuizAttempt | null> {
    const data = await this.prisma.stepQuizAttempt.findUnique({
      where: { id },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async update(attempt: StepQuizAttempt): Promise<StepQuizAttempt> {
    const data = await this.prisma.stepQuizAttempt.update({
      where: { id: attempt.id },
      data: {
        answers:
          (attempt.answers as unknown as Prisma.InputJsonValue) ??
          Prisma.JsonNull,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        passed: attempt.passed,
        completedAt: attempt.completedAt ?? undefined,
      },
    });
    return this.mapToDomain(data);
  }

  private mapToDomain(data: PrismaAttempt): StepQuizAttempt {
    return new StepQuizAttempt({
      id: data.id,
      userId: data.userId,
      roadmapId: data.roadmapId,
      conceptId: data.conceptId,
      questions: data.questions as unknown as StepQuizQuestion[],
      answers: data.answers as Record<number, string> | null,
      score: data.score,
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
      passed: data.passed,
      completedAt: data.completedAt ?? undefined,
      createdAt: data.createdAt,
    });
  }
}
