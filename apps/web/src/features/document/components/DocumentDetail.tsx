"use client";

import { lazy, Suspense, useEffect, useRef } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { Brain, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader, EmptyState, Button } from "@/common/components";
import { ButtonVariants, ButtonIconPositions } from "@/common/types";
import { useDocumentEvents, useAppDispatch } from "@/common/hooks";
import {
  useDocumentSummaryQuery,
  useDocumentQuizzesQuery,
} from "@/application/document";
import {
  useGetDocumentByIdQuery,
  documentApi,
} from "@/infrastructure/api/documentApi";
import { DocumentDetailHero } from "./DocumentDetailHero";
import { DocumentSummaryView } from "./DocumentSummaryView";
import { DocumentProcessingView } from "./DocumentProcessingView";
import { QuizCard } from "./QuizCard";
import { isDocumentProcessing } from "../utils";

const LazyDocumentConceptMap = lazy(() =>
  import("./DocumentConceptMap/DocumentConceptMap").then((m) => ({
    default: m.DocumentConceptMap,
  })),
);

const MotionBox = motion.create(Box);

interface DocumentDetailProps {
  documentId: string;
}

export function DocumentDetail({ documentId }: DocumentDetailProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: document, isLoading: docLoading } =
    useGetDocumentByIdQuery(documentId);
  const { data: summary, isLoading: summaryLoading } =
    useDocumentSummaryQuery(documentId);
  const { data: quizzes, isLoading: quizzesLoading } =
    useDocumentQuizzesQuery(documentId);

  const isProcessing = document ? isDocumentProcessing(document.status) : false;
  const isSummarized = document?.processingStage === "SUMMARIZED";
  const isFullyProcessing = isProcessing && !isSummarized;

  const { status: sseStatus, stage: sseStage } = useDocumentEvents(
    isProcessing ? documentId : null,
  );
  const hasSummaryInvalidated = useRef(false);
  const hasCompletedInvalidated = useRef(false);

  useEffect(() => {
    if (sseStage === "summarized" && !hasSummaryInvalidated.current) {
      hasSummaryInvalidated.current = true;
      dispatch(
        documentApi.util.invalidateTags([
          { type: "Document", id: documentId },
          { type: "DocumentSummary", id: documentId },
        ]),
      );
    }
    if (sseStatus === "completed" && !hasCompletedInvalidated.current) {
      hasCompletedInvalidated.current = true;
      dispatch(
        documentApi.util.invalidateTags([
          { type: "Document", id: documentId },
          { type: "DocumentSummary", id: documentId },
          { type: "Quiz", id: documentId },
        ]),
      );
    }
  }, [sseStatus, sseStage, dispatch, documentId]);

  if (docLoading) {
    return <Loader variant="page" message="Loading document" />;
  }

  if (!document) {
    return (
      <EmptyState
        title="Document not found"
        description="This document may have been deleted."
      />
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Back Button */}
      <Box>
        <Button
          label="Back to Documents"
          icon={ArrowLeft}
          iconPos={ButtonIconPositions.START}
          variant={ButtonVariants.GHOST}
          onClick={() => router.push("/documents")}
        />
      </Box>

      <DocumentDetailHero document={document} summary={summary} />

      {isFullyProcessing ? (
        <DocumentProcessingView documentId={documentId} />
      ) : (
        <>
          {/* Summary section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {summaryLoading ? (
              <Loader variant="circular" />
            ) : summary ? (
              <DocumentSummaryView summary={summary} />
            ) : (
              <EmptyState
                title="No summary yet"
                description="The summary will appear once the document is fully analyzed."
              />
            )}
          </MotionBox>

          {/* Concept Map */}
          {summary && (summary.conceptCount ?? 0) > 0 && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Suspense fallback={<Loader message="Loading concept map" />}>
                <LazyDocumentConceptMap documentId={documentId} />
              </Suspense>
            </MotionBox>
          )}

          {/* Quizzes section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Brain size={22} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Quizzes
              </Typography>
            </Box>
            <Box sx={{ mb: 15 }}>
              {isProcessing ? (
                <Loader
                  variant="circular"
                  message="Generating quiz questions..."
                />
              ) : quizzesLoading ? (
                <Loader variant="circular" />
              ) : quizzes && quizzes.length > 0 ? (
                <Grid container spacing={2}>
                  {quizzes.map((quiz, index) => (
                    <Grid key={quiz.id} size={{ xs: 12, sm: 6 }}>
                      <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.2 + index * 0.08,
                        }}
                      >
                        <QuizCard documentId={documentId} quiz={quiz} />
                      </MotionBox>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState
                  title="No quizzes yet"
                  description="Quizzes will be generated once the document is fully analyzed."
                  icon={Brain}
                />
              )}
            </Box>
          </MotionBox>
        </>
      )}
    </Box>
  );
}
