"use client";

import { Box, Typography, useTheme, alpha } from "@mui/material";
import { GitFork } from "lucide-react";
import { useLazyGetGraphQuery } from "@/infrastructure/api/roadmapApi";
import {
  BlueprintGraph,
  type BlueprintNodeData,
} from "@/shared/components/data-display/BlueprintGraph";
import { EmptyState, Loader } from "@/shared/components";
import { useDocumentGraphData } from "./useDocumentGraphData";
import { useEffect } from "react";

interface DocumentConceptMapProps {
  documentId: string;
  onConceptClick?: (conceptId: string) => void;
  height?: string | number;
}

export function DocumentConceptMap({
  documentId,
  onConceptClick,
  height = 500,
}: DocumentConceptMapProps) {
  const theme = useTheme();
  const [fetchGraph, { data: graphData, isLoading, isError }] =
    useLazyGetGraphQuery();

  useEffect(() => {
    fetchGraph(documentId);
  }, [documentId, fetchGraph]);

  const { nodes, edges } = useDocumentGraphData(graphData);

  const handleNodeClick = (nodeId: string, _data: BlueprintNodeData) => {
    onConceptClick?.(nodeId);
  };

  if (isLoading) {
    return <Loader message="Loading concept map" />;
  }

  if (isError || nodes.length === 0) {
    return (
      <EmptyState
        title="No concept map available"
        description="Concepts will appear here once the document is fully analyzed."
        icon={GitFork}
      />
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <GitFork size={20} color={theme.palette.accent} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: "1.1rem",
          }}
        >
          Concept Map
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: alpha(theme.palette.text.secondary, 0.6) }}
        >
          {nodes.length} concept{nodes.length !== 1 ? "s" : ""}
        </Typography>
      </Box>
      <BlueprintGraph
        nodes={nodes}
        edges={edges}
        direction="LR"
        onNodeClick={handleNodeClick}
        height={height}
        showMinimap={nodes.length > 8}
      />
    </Box>
  );
}
