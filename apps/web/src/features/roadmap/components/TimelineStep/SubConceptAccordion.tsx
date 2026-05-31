"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { ChevronDown, GitBranch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StepStatus, type RoadmapStep } from "@sagepoint/domain";
import { useUpdateProgressCommand } from "@/application/roadmap";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { SubConceptItem } from "./SubConceptItem";

const MotionBox = motion.create(Box);

interface SubConceptAccordionProps {
  subSteps: RoadmapStep[];
  stepProgress: Record<string, StepStatus>;
  parentOrder: number;
  roadmapId: string;
  isOwner: boolean;
}

export function SubConceptAccordion({
  subSteps,
  stepProgress,
  parentOrder,
  roadmapId,
  isOwner,
}: SubConceptAccordionProps) {
  const [open, setOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { execute: updateProgress } = useUpdateProgressCommand();

  if (subSteps.length === 0) return null;

  const completedCount = subSteps.filter(
    (s) => stepProgress[s.concept.id] === StepStatus.COMPLETED,
  ).length;
  const total = subSteps.length;
  const allDone = completedCount === total;

  const handleToggle = async (conceptId: string) => {
    const current = stepProgress[conceptId] ?? StepStatus.NOT_STARTED;
    const next =
      current === StepStatus.COMPLETED
        ? StepStatus.NOT_STARTED
        : StepStatus.COMPLETED;

    setTogglingId(conceptId);
    await updateProgress(roadmapId, conceptId, next);
    setTogglingId(null);
  };

  return (
    <Box
      sx={{
        marginTop: "4px",
        borderRadius: auroraPalette.radii.md,
        border: `1px solid ${auroraTint(auroraPalette.status.enrich, 0.18)}`,
        overflow: "hidden",
        background: auroraTint(auroraPalette.status.enrich, 0.04),
      }}
    >
      <Box
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "12px 16px",
          cursor: "pointer",
          transition: "background .15s",
          "&:hover": {
            background: auroraTint(auroraPalette.status.enrich, 0.08),
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <GitBranch size={14} color={auroraPalette.status.enrich} />
          <Box
            component="span"
            sx={{
              fontFamily: auroraPalette.font.mono,
              fontSize: "12.5px",
              fontWeight: 600,
              color: auroraPalette.status.enrich,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {total} recommended sub-topic{total === 1 ? "" : "s"}
          </Box>
          <Box
            component="span"
            sx={{
              fontFamily: auroraPalette.font.mono,
              fontSize: "12px",
              fontWeight: 500,
              color: allDone ? auroraPalette.status.ready : auroraPalette.txLow,
            }}
          >
            {completedCount}/{total} done
          </Box>
        </Box>

        <MotionBox
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          sx={{ display: "flex", color: auroraPalette.txMid }}
        >
          <ChevronDown size={16} />
        </MotionBox>
      </Box>

      <AnimatePresence>
        {open && (
          <MotionBox
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            sx={{ overflow: "hidden" }}
          >
            <Box
              sx={{
                borderTop: `1px solid ${auroraTint(auroraPalette.status.enrich, 0.12)}`,
                padding: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {subSteps.map((sub, i) => (
                <SubConceptItem
                  key={sub.concept.id}
                  step={sub}
                  status={
                    stepProgress[sub.concept.id] ?? StepStatus.NOT_STARTED
                  }
                  label={`${parentOrder}.${i + 1}`}
                  onToggle={
                    isOwner ? () => handleToggle(sub.concept.id) : undefined
                  }
                  isLoading={togglingId === sub.concept.id}
                />
              ))}
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
