"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { BlueprintNode } from "./nodes/BlueprintNode";
import { BlueprintEdge } from "./edges/BlueprintEdge";
import { applyElkLayout } from "./layout/elk-layout";
import { makeStyles } from "./BlueprintGraph.styles";
import { useFocusNavigation } from "./useFocusNavigation";
import type {
  BlueprintGraphProps,
  BlueprintNodeData,
  BlueprintNode as BlueprintNodeType,
  BlueprintEdge as BlueprintEdgeType,
} from "./BlueprintGraph.types";

const nodeTypes = { blueprint: BlueprintNode };
const edgeTypes = { blueprint: BlueprintEdge };

function BlueprintGraphInner({
  nodes: inputNodes,
  edges: inputEdges,
  direction = "TB",
  onNodeClick,
  showMinimap = true,
  showControls = true,
  height = 600,
  fitViewOnInit = true,
  className,
}: BlueprintGraphProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [nodes, setNodes, onNodesChange] = useNodesState<BlueprintNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<BlueprintEdgeType>([]);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const {
    handleNodeClick: onFocusClick,
    handlePaneClick,
    resetFocus,
  } = useFocusNavigation({ nodes, edges, setNodes, setEdges });

  // Layout effect
  useEffect(() => {
    let cancelled = false;

    const taggedNodes = inputNodes.map((n) => ({
      ...n,
      type: n.type ?? "blueprint",
    }));
    const taggedEdges = inputEdges.map((e) => ({
      ...e,
      type: e.type ?? "blueprint",
    }));

    applyElkLayout(taggedNodes, taggedEdges, direction).then(
      (layoutedNodes) => {
        if (cancelled) return;
        resetFocus();
        setNodes(layoutedNodes);
        setEdges(taggedEdges);
        setIsLayoutReady(true);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [inputNodes, inputEdges, direction, setNodes, setEdges, resetFocus]);

  // Node click: focus + external callback
  const handleNodeClick: NodeMouseHandler<BlueprintNodeType> = useCallback(
    (_, node) => {
      onFocusClick(node.id);
      onNodeClick?.(node.id, node.data as BlueprintNodeData);
    },
    [onFocusClick, onNodeClick],
  );

  if (!isLayoutReady) {
    return (
      <Box
        sx={{
          ...styles.container,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className={className}
      >
        <CircularProgress
          size={32}
          sx={{ color: alpha(theme.palette.accent, 0.5) }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ ...styles.container, height }} className={className}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={fitViewOnInit}
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color={alpha(theme.palette.accent, 0.15)}
        />
        {showControls && <Controls showInteractive={false} />}
        {showMinimap && (
          <MiniMap
            nodeColor={alpha(theme.palette.accent, 0.3)}
            maskColor={alpha("#0a1628", 0.85)}
            pannable
            zoomable
          />
        )}
      </ReactFlow>
    </Box>
  );
}

export function BlueprintGraph(props: BlueprintGraphProps) {
  return (
    <ReactFlowProvider>
      <BlueprintGraphInner {...props} />
    </ReactFlowProvider>
  );
}
