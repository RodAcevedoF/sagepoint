import { randomUUID } from "crypto";
import type {
  RoadmapStep,
  IStepQuizGenerationService,
  RoadmapStepQuestion,
  DiscoveredResource,
} from "@sagepoint/domain";

export async function enrichStepQuizzes(
  input: {
    roadmapId: string;
    steps: RoadmapStep[];
    resourceMap: Map<string, DiscoveredResource[]>;
  },
  deps: { service: IStepQuizGenerationService },
): Promise<RoadmapStepQuestion[]> {
  const { roadmapId, steps, resourceMap } = input;
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
      questionCount: 2,
      resourceSnippets: (resourceMap.get(step.concept.id) ?? [])
        .slice(0, 2)
        .map((r) => r.description ?? r.title),
    })),
  );

  const conceptOrderMap = new Map(steps.map((s) => [s.concept.id, s.order]));

  return generated.flatMap((result) => {
    const stepOrder = conceptOrderMap.get(result.conceptId) ?? 0;
    return result.questions.map((q) => ({
      id: randomUUID(),
      roadmapId,
      conceptId: result.conceptId,
      stepOrder,
      text: q.text,
      type: q.type,
      options: q.options,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));
  });
}
