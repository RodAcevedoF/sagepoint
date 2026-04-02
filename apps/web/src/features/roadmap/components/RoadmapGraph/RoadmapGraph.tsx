"use client";

import type { RoadmapStep } from "@sagepoint/domain";
import { StepStatus } from "@sagepoint/domain";
import { BlueprintGraph } from "@/common/components/BlueprintGraph";
import type { BlueprintNodeData } from "@/common/components/BlueprintGraph";
import { useRoadmapGraphData } from "./useRoadmapGraphData";

interface RoadmapGraphProps {
  steps: RoadmapStep[];
  stepProgress: Record<string, StepStatus>;
  onStepClick?: (conceptId: string) => void;
  height?: string | number;
}

export function RoadmapGraph({
  steps,
  stepProgress,
  onStepClick,
  height = 600,
}: RoadmapGraphProps) {
  const { nodes, edges } = useRoadmapGraphData(steps, stepProgress);

  const handleNodeClick = (nodeId: string, _data: BlueprintNodeData) => {
    onStepClick?.(nodeId);
  };

  return (
    <BlueprintGraph
      nodes={nodes}
      edges={edges}
      direction="TB"
      onNodeClick={handleNodeClick}
      height={height}
    />
  );
}
