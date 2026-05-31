"use client";

import { lazy, Suspense, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StepStatus, type RoadmapStep } from "@sagepoint/domain";
import {
  useUpdateProgressCommand,
  useExpandConceptCommand,
  useStepQuizCommand,
} from "@/application/roadmap";
import type { PreGeneratedQuiz } from "@/application/roadmap/commands/step-quiz.command";
import { useModal, useSnackbar, Loader, ModalTitle } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import type { ResourceDto } from "@/infrastructure/api/roadmapApi";
import { StepIndicator } from "./StepIndicator";
import { StepHeader } from "./StepHeader";
import { StepContent } from "./StepContent";

const LazyStepQuizModal = lazy(() =>
  import("../StepQuizModal/StepQuizModal").then((m) => ({
    default: m.StepQuizModal,
  })),
);

const MotionBox = motion.create(Box);

interface TimelineStepProps {
  step: RoadmapStep;
  roadmapId: string;
  status: StepStatus;
  resources: ResourceDto[];
  resourcesLoading?: boolean;
  isLast?: boolean;
  index: number;
  parentDocumentId?: string;
  isExpanded?: boolean;
  subSteps?: RoadmapStep[];
  subStepProgress?: Record<string, StepStatus>;
  subStepResources?: Record<string, ResourceDto[]>;
  parentOrder?: number;
  isOwner: boolean;
}

export function TimelineStep({
  step,
  roadmapId,
  status,
  resources,
  resourcesLoading,
  isLast = false,
  index,
  parentDocumentId,
  isExpanded = false,
  subSteps = [],
  subStepProgress = {},
  parentOrder,
  isOwner,
}: TimelineStepProps) {
  const isMobile = useMediaQuery("(max-width:625px)");
  const { openModal, closeModal } = useModal();
  const { showSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [preGeneratedQuiz, setPreGeneratedQuiz] =
    useState<PreGeneratedQuiz | null>(null);
  const [quizReady, setQuizReady] = useState(false);
  const { execute: updateProgress, isLoading } = useUpdateProgressCommand();
  const { execute: expandConcept, isLoading: expandLoading } =
    useExpandConceptCommand();
  const { generate } = useStepQuizCommand();

  const handleExpand = async () => {
    const result = await expandConcept(roadmapId, step.concept.id);
    if (result.ok) {
      showSnackbar("Sub-concepts added to your roadmap", {
        severity: "success",
      });
    } else {
      showSnackbar("Failed to expand concept", { severity: "error" });
    }
  };

  const handleStatusChange = async (newStatus: StepStatus) => {
    if (
      newStatus === StepStatus.COMPLETED &&
      status === StepStatus.IN_PROGRESS
    ) {
      openModal(
        <Suspense fallback={<Loader />}>
          <LazyStepQuizModal
            roadmapId={roadmapId}
            conceptId={step.concept.id}
            conceptName={step.concept.name}
            preGeneratedQuiz={preGeneratedQuiz}
            onClose={() => {
              setPreGeneratedQuiz(null);
              setQuizReady(false);
              closeModal();
            }}
          />
        </Suspense>,
        {
          maxWidth: "sm",
          showCloseButton: true,
          closeOnOverlay: false,
        },
      );
      return;
    }

    const progressResult = await updateProgress(
      roadmapId,
      step.concept.id,
      newStatus,
    );
    if (!progressResult.ok) {
      console.error("Failed to update progress:", progressResult.error);
      return;
    }

    if (newStatus === StepStatus.IN_PROGRESS) {
      generate(roadmapId, step.concept.id).then((result) => {
        if (result.ok) {
          setPreGeneratedQuiz(result.data);
          setQuizReady(true);
        } else {
          console.warn(
            "Quiz pre-generation failed, will generate on demand:",
            result.error,
          );
        }
      });
    }
  };

  const canExpand = !isExpanded && subSteps.length === 0;

  const renderContent = () => (
    <StepContent
      step={step}
      resources={resources}
      resourcesLoading={resourcesLoading}
      onExpand={canExpand && isOwner ? handleExpand : undefined}
      isOwner={isOwner}
      expandLoading={expandLoading}
      subSteps={subSteps}
      subStepProgress={subStepProgress}
      parentOrder={parentOrder ?? step.order}
      roadmapId={roadmapId}
    />
  );

  const handleToggle = () => {
    if (isMobile) {
      openModal(
        <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <ModalTitle
            eyebrow={`Step ${step.order}`}
            title={step.concept.name}
            icon={<BookOpen size={20} />}
            tone="teal"
          />
          {renderContent()}
        </Box>,
        {
          maxWidth: "lg",
          showCloseButton: true,
        },
      );
      return;
    }
    setOpen((prev) => !prev);
  };

  return (
    <MotionBox
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
      sx={{
        position: "relative",
        marginBottom: isLast ? 0 : "18px",
      }}
    >
      <StepIndicator order={step.order} status={status} isOpen={open} />

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: auroraPalette.radii.card,
          border: `1px solid ${open ? auroraTint(auroraPalette.teal, 0.3) : auroraPalette.line}`,
          background:
            "linear-gradient(168deg, oklch(0.225 0.026 262 / 0.88), oklch(0.165 0.026 262 / 0.8))",
          boxShadow: auroraPalette.shadow.card,
          transition: "border-color .2s",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: "-50%",
            left: "-8%",
            width: "50%",
            height: "100%",
            background: `radial-gradient(closest-side, ${auroraTint(auroraPalette.teal, 0.2)}, transparent)`,
            filter: "blur(20px)",
            opacity: open ? 0.5 : 0,
            transition: "opacity .25s",
            pointerEvents: "none",
          }}
        />

        <StepHeader
          step={step}
          status={status}
          expanded={open}
          onToggle={handleToggle}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
          parentDocumentId={parentDocumentId}
          quizReady={quizReady}
          isOwner={isOwner}
        />

        <AnimatePresence>
          {open && !isMobile && (
            <MotionBox
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              sx={{ overflow: "hidden", position: "relative", zIndex: 1 }}
            >
              {renderContent()}
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </MotionBox>
  );
}
