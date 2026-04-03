import { useState, useEffect, useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import type {
  BlueprintNode as BlueprintNodeType,
  BlueprintEdge as BlueprintEdgeType,
} from "./BlueprintGraph.types";

/** Build adjacency map: nodeId → Set of connected nodeIds */
function buildAdjacency(edges: BlueprintEdgeType[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, new Set());
    if (!adj.has(e.target)) adj.set(e.target, new Set());
    adj.get(e.source)!.add(e.target);
    adj.get(e.target)!.add(e.source);
  }
  return adj;
}

/** Parse order value (e.g. 1, 2, "1.1", "2.3") into a comparable number */
function parseOrder(order?: number | string): number {
  if (order === undefined) return Infinity;
  if (typeof order === "number") return order;
  return parseFloat(order) || Infinity;
}

/**
 * Find the best node to navigate to in a direction.
 * - Up/Down: follow edges (parent → child / child → parent)
 * - Left/Right: previous/next step by order number
 */
function findNeighborInDirection(
  focusedId: string,
  direction: "up" | "down" | "left" | "right",
  nodes: BlueprintNodeType[],
  adjacency: Map<string, Set<string>>,
): string | null {
  const focused = nodes.find((n) => n.id === focusedId);
  if (!focused) return null;

  if (direction === "left" || direction === "right") {
    // Navigate by step order
    const sorted = [...nodes].sort(
      (a, b) =>
        parseOrder(a.data.order as number | string | undefined) -
        parseOrder(b.data.order as number | string | undefined),
    );
    const idx = sorted.findIndex((n) => n.id === focusedId);
    if (idx === -1) return null;

    const nextIdx = direction === "right" ? idx + 1 : idx - 1;
    if (nextIdx < 0 || nextIdx >= sorted.length) return null;
    return sorted[nextIdx].id;
  }

  // Up/Down: edge-connected neighbors by position
  const neighbors = adjacency.get(focusedId);
  if (!neighbors || neighbors.size === 0) return null;

  const candidates = nodes
    .filter((n) => neighbors.has(n.id))
    .filter((n) => {
      const dy = n.position.y - focused.position.y;
      return direction === "up" ? dy < -10 : dy > 10;
    });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const da =
      Math.abs(a.position.x - focused.position.x) +
      Math.abs(a.position.y - focused.position.y);
    const db =
      Math.abs(b.position.x - focused.position.x) +
      Math.abs(b.position.y - focused.position.y);
    return da - db;
  });

  return candidates[0].id;
}

/** Get IDs of nodes connected to the focused node (including itself) */
function getConnectedNodeIds(
  focusedId: string,
  edges: BlueprintEdgeType[],
): Set<string> {
  const connected = new Set<string>([focusedId]);
  for (const e of edges) {
    if (e.source === focusedId || e.target === focusedId) {
      connected.add(e.source);
      connected.add(e.target);
    }
  }
  return connected;
}

// ============================================================================
// Hook
// ============================================================================

const DIR_MAP: Record<string, "up" | "down" | "left" | "right"> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

interface UseFocusNavigationOptions {
  nodes: BlueprintNodeType[];
  edges: BlueprintEdgeType[];
  setNodes: (
    updater: (prev: BlueprintNodeType[]) => BlueprintNodeType[],
  ) => void;
  setEdges: (
    updater: (prev: BlueprintEdgeType[]) => BlueprintEdgeType[],
  ) => void;
}

export function useFocusNavigation({
  nodes,
  edges,
  setNodes,
  setEdges,
}: UseFocusNavigationOptions) {
  const { fitView } = useReactFlow();
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Refs synced via effects (not during render)
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const focusedRef = useRef(focusedNodeId);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);
  useEffect(() => {
    focusedRef.current = focusedNodeId;
  }, [focusedNodeId]);

  // Inject _focused / _dimmed data into nodes and edges
  useEffect(() => {
    const connectedIds = focusedNodeId
      ? getConnectedNodeIds(focusedNodeId, edgesRef.current)
      : null;

    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: {
          ...n.data,
          _focused: focusedNodeId === n.id,
          _dimmed: connectedIds !== null && !connectedIds.has(n.id),
        },
      })),
    );

    setEdges((prev) =>
      prev.map((e) => ({
        ...e,
        data: {
          ...e.data,
          _dimmed:
            focusedNodeId !== null &&
            e.source !== focusedNodeId &&
            e.target !== focusedNodeId,
        },
      })),
    );
  }, [focusedNodeId, setNodes, setEdges]);

  // Pan to focused node
  useEffect(() => {
    if (!focusedNodeId) return;
    fitView({ nodes: [{ id: focusedNodeId }], duration: 300, padding: 0.5 });
  }, [focusedNodeId, fitView]);

  // Keyboard navigation — attached to document so it works regardless
  // of container focus. Only acts when a node is focused.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept keys when user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Escape" && focusedRef.current) {
        setFocusedNodeId(null);
        return;
      }

      const focused = focusedRef.current;
      if (!focused) return;

      const dir = DIR_MAP[e.key];
      if (!dir) return;

      e.preventDefault();
      const adjacency = buildAdjacency(edgesRef.current);
      const next = findNeighborInDirection(
        focused,
        dir,
        nodesRef.current,
        adjacency,
      );
      if (next) setFocusedNodeId(next);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handlers for the graph component
  const handleNodeClick = useCallback((nodeId: string) => {
    setFocusedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const handlePaneClick = useCallback(() => {
    setFocusedNodeId(null);
  }, []);

  const resetFocus = useCallback(() => {
    setFocusedNodeId(null);
  }, []);

  return { focusedNodeId, handleNodeClick, handlePaneClick, resetFocus };
}
