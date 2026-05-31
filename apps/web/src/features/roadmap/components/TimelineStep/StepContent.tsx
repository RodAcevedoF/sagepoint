"use client";

import { Box, CircularProgress } from "@mui/material";
import { Target, Lightbulb, GitBranch } from "lucide-react";
import type { RoadmapStep, StepStatus } from "@sagepoint/domain";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import type { ResourceDto } from "@/infrastructure/api/roadmapApi";
import { StepResources } from "../StepResources";
import { SubConceptAccordion } from "./SubConceptAccordion";

interface StepContentProps {
  step: RoadmapStep;
  resources: ResourceDto[];
  resourcesLoading?: boolean;
  onExpand?: () => void;
  expandLoading?: boolean;
  subSteps?: RoadmapStep[];
  subStepProgress?: Record<string, StepStatus>;
  parentOrder?: number;
  roadmapId?: string;
  isOwner: boolean;
}

interface InfoBlockProps {
  tone: "concept" | "ready";
  icon: React.ReactNode;
  label: string;
  text: string;
}

function InfoBlock({ tone, icon, label, text }: InfoBlockProps) {
  const color =
    tone === "concept"
      ? auroraPalette.status.concept
      : auroraPalette.status.ready;
  return (
    <Box
      sx={{
        borderRadius: auroraPalette.radii.md,
        border: `1px solid ${auroraTint(color, 0.28)}`,
        padding: "16px 18px",
        background: auroraTint(color, 0.07),
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          fontFamily: auroraPalette.font.mono,
          fontSize: "11.5px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "9px",
          color,
        }}
      >
        {icon}
        {label}
      </Box>
      <Box
        component="p"
        sx={{
          margin: 0,
          fontSize: "14.5px",
          lineHeight: 1.6,
          color: auroraPalette.tx,
        }}
      >
        {text}
      </Box>
    </Box>
  );
}

export function StepContent({
  step,
  resources,
  resourcesLoading,
  onExpand,
  expandLoading,
  subSteps = [],
  subStepProgress = {},
  parentOrder = 0,
  roadmapId = "",
  isOwner,
}: StepContentProps) {
  return (
    <Box
      sx={{
        padding: { xs: "4px 18px 18px", md: "4px 24px 24px" },
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {step.learningObjective && (
        <InfoBlock
          tone="concept"
          icon={<Target size={15} />}
          label="Learning Objective"
          text={step.learningObjective}
        />
      )}

      {step.rationale && (
        <InfoBlock
          tone="ready"
          icon={<Lightbulb size={15} />}
          label="Why this step?"
          text={step.rationale}
        />
      )}

      <StepResources resources={resources} isLoading={resourcesLoading} />

      {subSteps.length > 0 ? (
        <SubConceptAccordion
          subSteps={subSteps}
          stepProgress={subStepProgress}
          parentOrder={parentOrder}
          roadmapId={roadmapId}
          isOwner={isOwner}
        />
      ) : (
        onExpand && (
          <Box
            onClick={expandLoading ? undefined : onExpand}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              alignSelf: "flex-start",
              padding: "10px 16px",
              borderRadius: auroraPalette.radii.md,
              background: "transparent",
              border: `1px dashed ${auroraPalette.line2}`,
              color: auroraPalette.teal,
              fontFamily: auroraPalette.font.ui,
              fontWeight: 600,
              fontSize: "13.5px",
              cursor: expandLoading ? "default" : "pointer",
              opacity: expandLoading ? 0.6 : 1,
              transition: "all .15s",
              "&:hover": expandLoading
                ? undefined
                : {
                    background: auroraTint(auroraPalette.teal, 0.08),
                    borderColor: auroraTint(auroraPalette.teal, 0.4),
                  },
            }}
          >
            {expandLoading ? (
              <CircularProgress size={14} sx={{ color: "inherit" }} />
            ) : (
              <GitBranch size={16} />
            )}
            {expandLoading ? "Expanding..." : "Expand Sub-concepts"}
          </Box>
        )
      )}
    </Box>
  );
}
