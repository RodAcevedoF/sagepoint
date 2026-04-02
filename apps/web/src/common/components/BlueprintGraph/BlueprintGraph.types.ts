import type { Node, Edge } from "@xyflow/react";

export type BlueprintNodeStatus =
  | "default"
  | "active"
  | "completed"
  | "locked"
  | "skipped";

export interface BlueprintNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  status?: BlueprintNodeStatus;
  difficulty?: string;
  order?: number;
  metadata?: Record<string, unknown>;
}

export type BlueprintNode = Node<BlueprintNodeData>;

export interface BlueprintEdgeData extends Record<string, unknown> {
  type?: "dependency" | "related" | "same_as";
}

export type BlueprintEdge = Edge<BlueprintEdgeData>;

export type LayoutDirection = "TB" | "LR";

export interface BlueprintGraphProps {
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
  direction?: LayoutDirection;
  onNodeClick?: (nodeId: string, data: BlueprintNodeData) => void;
  showMinimap?: boolean;
  showControls?: boolean;
  height?: string | number;
  fitViewOnInit?: boolean;
  className?: string;
}
