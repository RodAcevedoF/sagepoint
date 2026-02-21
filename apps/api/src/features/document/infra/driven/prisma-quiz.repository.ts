import type { IQuizRepository } from '@sagepoint/domain';
import { Quiz } from '@sagepoint/domain';
import type { Quiz as PrismaQuiz } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

export class PrismaQuizRepository implements IQuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(quiz: Quiz): Promise<void> {
    await this.prisma.quiz.upsert({
      where: { id: quiz.id },
      create: {
        id: quiz.id,
        documentId: quiz.documentId,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.questionCount,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      },
      update: {
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.questionCount,
        updatedAt: quiz.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Quiz | null> {
    const data = await this.prisma.quiz.findUnique({ where: { id } });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findByDocumentId(documentId: string): Promise<Quiz[]> {
    const data = await this.prisma.quiz.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quiz.delete({ where: { id } });
  }

  private mapToDomain(data: PrismaQuiz): Quiz {
    return new Quiz(
      data.id,
      data.documentId,
      data.title,
      data.questionCount,
      data.createdAt,
      data.updatedAt,
      data.description ?? undefined,
    );
  }
}
