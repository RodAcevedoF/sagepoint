import { randomUUID } from "crypto";
import type {
  RoadmapStep,
  IStepQuizGenerationService,
  RoadmapStepQuestion,
} from "@sagepoint/domain";

export async function generateStepQuizzes(
  input: { roadmapId: string; steps: RoadmapStep[] },
  deps: { service: IStepQuizGenerationService },
): Promise<RoadmapStepQuestion[]> {
  const { roadmapId, steps } = input;
  const { service } = deps;

  if (steps.length === 0) return [];

  const generated = await service.generateForSteps(
    steps.map((step) => ({
      conceptId: step.concept.id,
      conceptName: step.concept.name,
      conceptDescription: step.concept.description ?? undefined,
      learningObjective: step.learningObjective,
      rationale: step.rationale,
      difficulty: step.difficulty,
      questionCount: 3,
    })),
  );

  const conceptOrderMap = new Map(steps.map((s) => [s.concept.id, s.order]));

  return generated.flatMap((result) => {
    const stepOrder = conceptOrderMap.get(result.conceptId) ?? 0;
    return result.questions.map((q, position) => ({
      id: randomUUID(),
      roadmapId,
      conceptId: result.conceptId,
      stepOrder,
      position,
      text: q.text,
      type: q.type,
      options: q.options,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));
  });
}
