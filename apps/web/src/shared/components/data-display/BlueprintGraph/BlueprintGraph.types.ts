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
  order?: number | string;
  metadata?: Record<string, unknown>;
  /** Set by BlueprintGraph when a node is focused (click-to-focus) */
  _focused?: boolean;
  /** Set by BlueprintGraph when another node is focused (this node is dimmed) */
  _dimmed?: boolean;
}

export type BlueprintNode = Node<BlueprintNodeData>;

export interface BlueprintEdgeData extends Record<string, unknown> {
  type?: "dependency" | "related" | "same_as";
  /** Set by BlueprintGraph when the edge is not connected to the focused node */
  _dimmed?: boolean;
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
