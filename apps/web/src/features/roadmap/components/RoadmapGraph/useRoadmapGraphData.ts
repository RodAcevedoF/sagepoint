import { useMemo } from "react";
import { StepStatus } from "@sagepoint/domain";
import type { RoadmapStep } from "@sagepoint/domain";
import type {
  BlueprintNode,
  BlueprintEdge,
  BlueprintNodeStatus,
} from "@/common/components/BlueprintGraph";

function toNodeStatus(stepStatus: StepStatus): BlueprintNodeStatus {
  switch (stepStatus) {
    case StepStatus.COMPLETED:
      return "completed";
    case StepStatus.IN_PROGRESS:
      return "active";
    case StepStatus.SKIPPED:
      return "skipped";
    default:
      return "default";
  }
}

export function useRoadmapGraphData(
  steps: RoadmapStep[],
  stepProgress: Record<string, StepStatus>,
): { nodes: BlueprintNode[]; edges: BlueprintEdge[] } {
  return useMemo(() => {
    const nodes: BlueprintNode[] = steps.map((step) => {
      const status = stepProgress[step.concept.id] ?? StepStatus.NOT_STARTED;
      return {
        id: step.concept.id,
        type: "blueprint",
        position: { x: 0, y: 0 },
        data: {
          label: step.concept.name,
          description: step.learningObjective,
          status: toNodeStatus(status),
          difficulty: step.difficulty,
          order: step.order,
        },
      };
    });

    const edges: BlueprintEdge[] = steps.flatMap((step) =>
      step.dependsOn.map((depId) => ({
        id: `${depId}->${step.concept.id}`,
        source: depId,
        target: step.concept.id,
        type: "blueprint",
        data: { type: "dependency" as const },
      })),
    );

    return { nodes, edges };
  }, [steps, stepProgress]);
}
