import { useMemo } from "react";
import type {
  GraphDataDto,
  GraphNodeDto,
  GraphEdgeDto,
} from "@/infrastructure/api/roadmapApi";
import type {
  BlueprintNode,
  BlueprintEdge,
} from "@/shared/components/data-display/BlueprintGraph";

function toEdgeType(raw: string): "dependency" | "related" | "same_as" {
  switch (raw) {
    case "DEPENDS_ON":
      return "dependency";
    case "SAME_AS":
      return "same_as";
    default:
      return "related";
  }
}

export function useDocumentGraphData(graphData: GraphDataDto | undefined): {
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
} {
  return useMemo(() => {
    if (!graphData || graphData.nodes.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodes: BlueprintNode[] = graphData.nodes.map(
      (node: GraphNodeDto) => ({
        id: node.id,
        type: "blueprint",
        position: { x: 0, y: 0 },
        data: {
          label: node.name,
          description: node.description,
          status: "default" as const,
        },
      }),
    );

    const nodeIds = new Set(nodes.map((n) => n.id));

    const edges: BlueprintEdge[] = graphData.edges
      .filter(
        (edge: GraphEdgeDto) => nodeIds.has(edge.from) && nodeIds.has(edge.to),
      )
      .map((edge: GraphEdgeDto) => ({
        id: `${edge.from}->${edge.to}`,
        source: edge.from,
        target: edge.to,
        type: "blueprint",
        data: { type: toEdgeType(edge.type) },
      }));

    return { nodes, edges };
  }, [graphData]);
}
