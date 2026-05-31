"use client";

import { Box } from "@mui/material";
import { GitFork } from "lucide-react";
import { useLazyGetGraphQuery } from "@/infrastructure/api/roadmapApi";
import {
  BlueprintGraph,
  type BlueprintNodeData,
} from "@/shared/components/data-display/BlueprintGraph";
import { Card, EmptyState, Loader } from "@/shared/components";
import { aurora as auroraPalette } from "@/shared/theme";
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
    <Card variant="aurora" tone="teal" hoverable={false} withAura={false}>
      <Card.Body
        sx={{ padding: { xs: "22px 24px 26px", md: "30px 34px 32px" } }}
      >
        <Card.Head sx={{ alignItems: "center", marginBottom: "22px" }}>
          <Card.Icon>
            <GitFork size={22} />
          </Card.Icon>
          <Card.Title
            sx={{
              fontSize: "23px",
              WebkitLineClamp: "unset",
              display: "block",
              overflow: "visible",
              flex: 1,
            }}
          >
            Concept Map
          </Card.Title>
          <Box
            component="span"
            sx={{
              fontFamily: auroraPalette.font.mono,
              fontSize: "13px",
              color: auroraPalette.txLow,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {nodes.length} concept{nodes.length !== 1 ? "s" : ""}
          </Box>
        </Card.Head>

        <BlueprintGraph
          nodes={nodes}
          edges={edges}
          direction="LR"
          onNodeClick={handleNodeClick}
          height={height}
          showMinimap={nodes.length > 8}
        />
      </Card.Body>
    </Card>
  );
}
