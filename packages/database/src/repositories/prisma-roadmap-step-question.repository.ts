import type {
  IRoadmapStepQuestionRepository,
  RoadmapStepQuestion,
} from "@sagepoint/domain";
import type { PrismaClient } from "../generated/prisma/client";
import type { QuestionOption } from "@sagepoint/domain";

export class PrismaRoadmapStepQuestionRepository implements IRoadmapStepQuestionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveMany(items: RoadmapStepQuestion[]): Promise<void> {
    if (items.length === 0) return;
    await this.prisma.roadmapStepQuestion.createMany({
      data: items.map((item) => ({
        id: item.id,
        roadmapId: item.roadmapId,
        conceptId: item.conceptId,
        stepOrder: item.stepOrder,
        position: item.position,
        text: item.text,
        type: item.type,
        options: item.options as object[],
        explanation: item.explanation,
        difficulty: item.difficulty,
      })),
    });
  }

  async upsertMany(items: RoadmapStepQuestion[]): Promise<void> {
    if (items.length === 0) return;
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.roadmapStepQuestion.upsert({
          where: {
            roadmapId_conceptId_position: {
              roadmapId: item.roadmapId,
              conceptId: item.conceptId,
              position: item.position,
            },
          },
          create: {
            id: item.id,
            roadmapId: item.roadmapId,
            conceptId: item.conceptId,
            stepOrder: item.stepOrder,
            position: item.position,
            text: item.text,
            type: item.type,
            options: item.options as object[],
            explanation: item.explanation,
            difficulty: item.difficulty,
          },
          update: {
            stepOrder: item.stepOrder,
            text: item.text,
            type: item.type,
            options: item.options as object[],
            explanation: item.explanation,
            difficulty: item.difficulty,
          },
        }),
      ),
    );
  }

  async deleteByRoadmapId(roadmapId: string): Promise<void> {
    await this.prisma.roadmapStepQuestion.deleteMany({ where: { roadmapId } });
  }

  async findByRoadmapId(roadmapId: string): Promise<RoadmapStepQuestion[]> {
    const rows = await this.prisma.roadmapStepQuestion.findMany({
      where: { roadmapId },
      orderBy: [{ stepOrder: "asc" }, { position: "asc" }],
    });
    return rows.map(rowToDomain);
  }

  async findByRoadmapAndConcept(
    roadmapId: string,
    conceptId: string,
  ): Promise<RoadmapStepQuestion[]> {
    const rows = await this.prisma.roadmapStepQuestion.findMany({
      where: { roadmapId, conceptId },
      orderBy: { position: "asc" },
    });
    return rows.map(rowToDomain);
  }

  async findManyByIds(ids: string[]): Promise<RoadmapStepQuestion[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.roadmapStepQuestion.findMany({
      where: { id: { in: ids } },
    });
    return rows.map(rowToDomain);
  }
}

type RoadmapStepQuestionRow = {
  id: string;
  roadmapId: string;
  conceptId: string;
  stepOrder: number;
  position: number;
  text: string;
  type: string;
  options: unknown;
  explanation: string | null;
  difficulty: string;
};

function rowToDomain(row: RoadmapStepQuestionRow): RoadmapStepQuestion {
  return {
    id: row.id,
    roadmapId: row.roadmapId,
    conceptId: row.conceptId,
    stepOrder: row.stepOrder,
    position: row.position,
    text: row.text,
    type: row.type as RoadmapStepQuestion["type"],
    options: row.options as QuestionOption[],
    explanation: row.explanation ?? undefined,
    difficulty: row.difficulty,
  };
}
