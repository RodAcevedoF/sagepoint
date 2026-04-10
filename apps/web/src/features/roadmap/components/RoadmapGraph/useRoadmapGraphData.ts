import { useMemo } from "react";
import { StepStatus } from "@sagepoint/domain";
import type { RoadmapStep } from "@sagepoint/domain";
import type {
  BlueprintNode,
  BlueprintEdge,
  BlueprintNodeStatus,
} from "@/shared/components/data-display/BlueprintGraph";

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

function isSubConcept(step: RoadmapStep): boolean {
  return step.rationale?.startsWith("Sub-concept of") ?? false;
}

export function useRoadmapGraphData(
  steps: RoadmapStep[],
  stepProgress: Record<string, StepStatus>,
): { nodes: BlueprintNode[]; edges: BlueprintEdge[] } {
  return useMemo(() => {
    // Build parent order lookup for dotted notation
    const parentOrderById = new Map<string, number>();
    const subCountByParent = new Map<string, number>();

    for (const step of steps) {
      if (!isSubConcept(step)) {
        parentOrderById.set(step.concept.id, step.order);
      }
    }

    function getDisplayOrder(step: RoadmapStep): number | string {
      if (!isSubConcept(step)) return step.order;

      // Find parent concept ID (first dependsOn that is a top-level step)
      const parentId = step.dependsOn.find((id) => parentOrderById.has(id));
      if (!parentId) return step.order;

      const parentOrder = parentOrderById.get(parentId)!;
      const count = (subCountByParent.get(parentId) ?? 0) + 1;
      subCountByParent.set(parentId, count);
      return `${parentOrder}.${count}`;
    }

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
          order: getDisplayOrder(step),
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
