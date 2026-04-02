import ELK from "elkjs/lib/elk.bundled.js";
import type {
  BlueprintNode,
  BlueprintEdge,
  LayoutDirection,
} from "../BlueprintGraph.types";

const elk = new ELK();

const NODE_WIDTH = 220;
const NODE_HEIGHT = 90;

export async function applyElkLayout(
  nodes: BlueprintNode[],
  edges: BlueprintEdge[],
  direction: LayoutDirection = "TB",
): Promise<BlueprintNode[]> {
  if (nodes.length === 0) return [];

  const elkDirection = direction === "TB" ? "DOWN" : "RIGHT";

  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": elkDirection,
      "elk.spacing.nodeNode": "60",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.layered.spacing.edgeNodeBetweenLayers": "40",
      "elk.padding": "[top=40,left=40,bottom=40,right=40]",
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layout = await elk.layout(graph);

  return nodes.map((node) => {
    const elkNode = layout.children?.find((n) => n.id === node.id);
    return {
      ...node,
      position: {
        x: elkNode?.x ?? 0,
        y: elkNode?.y ?? 0,
      },
    };
  });
}
