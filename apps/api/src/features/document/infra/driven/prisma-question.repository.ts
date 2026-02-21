import type { IQuestionRepository, QuestionOption } from '@sagepoint/domain';
import { Question, QuestionType } from '@sagepoint/domain';
import type { Question as PrismaQuestion, Prisma } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

function toJsonValue(options: QuestionOption[]): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(options)) as Prisma.InputJsonValue;
}

export class PrismaQuestionRepository implements IQuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveMany(questions: Question[]): Promise<void> {
    await this.prisma.$transaction(
      questions.map((q) =>
        this.prisma.question.upsert({
          where: { id: q.id },
          create: {
            id: q.id,
            quizId: q.quizId,
            type: q.type,
            text: q.text,
            options: toJsonValue(q.options),
            explanation: q.explanation,
            conceptId: q.conceptId,
            order: q.order,
            difficulty: q.difficulty,
            createdAt: q.createdAt,
          },
          update: {
            text: q.text,
            options: toJsonValue(q.options),
            explanation: q.explanation,
            order: q.order,
            difficulty: q.difficulty,
          },
        }),
      ),
    );
  }

  async findByQuizId(quizId: string): Promise<Question[]> {
    const data = await this.prisma.question.findMany({
      where: { quizId },
      orderBy: { order: 'asc' },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async deleteByQuizId(quizId: string): Promise<void> {
    await this.prisma.question.deleteMany({ where: { quizId } });
  }

  private mapToDomain(data: PrismaQuestion): Question {
    return new Question(
      data.id,
      data.quizId,
      data.type as QuestionType,
      data.text,
      data.options as unknown as QuestionOption[],
      data.order,
      data.difficulty,
      data.createdAt,
      data.explanation ?? undefined,
      data.conceptId ?? undefined,
    );
  }
}
