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
        text: item.text,
        type: item.type,
        options: item.options as object[],
        explanation: item.explanation,
        difficulty: item.difficulty,
      })),
    });
  }

  async findByRoadmapId(roadmapId: string): Promise<RoadmapStepQuestion[]> {
    const rows = await this.prisma.roadmapStepQuestion.findMany({
      where: { roadmapId },
      orderBy: { stepOrder: "asc" },
    });
    return rows.map((row) => ({
      id: row.id,
      roadmapId: row.roadmapId,
      conceptId: row.conceptId,
      stepOrder: row.stepOrder,
      text: row.text,
      type: row.type as RoadmapStepQuestion["type"],
      options: row.options as unknown as QuestionOption[],
      explanation: row.explanation ?? undefined,
      difficulty: row.difficulty,
    }));
  }
}
