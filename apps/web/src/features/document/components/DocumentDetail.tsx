"use client";

import { lazy, Suspense, useEffect, useRef } from "react";
import { Box, Grid } from "@mui/material";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";
import { BackLink, Card, EmptyState, Loader } from "@/shared/components";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { useDocumentEvents, useAppDispatch } from "@/shared/hooks";
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
import { SUMMARY_READY_STAGES } from "../utils";

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
  const currentUserId = useCurrentUser()?.id;
  const { data: document, isLoading: docLoading } =
    useGetDocumentByIdQuery(documentId);
  const { data: summary, isLoading: summaryLoading } =
    useDocumentSummaryQuery(documentId);
  const { data: quizzes, isLoading: quizzesLoading } =
    useDocumentQuizzesQuery(documentId);

  const hasSummary =
    !!document?.processingStage &&
    SUMMARY_READY_STAGES.has(document.processingStage);
  // Still actively parsing/analyzing — no summary yet
  const isFullyProcessing = document?.status === "PROCESSING" && !hasSummary;
  // Summary done but quiz/concepts still generating
  const isEnriching = document?.status === "PROCESSING" && hasSummary;

  const { status: sseStatus, stage: sseStage } = useDocumentEvents(
    document?.status === "PROCESSING" ? documentId : null,
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        paddingTop: "4px",
        paddingBottom: "64px",
      }}
    >
      <BackLink label="Back to Documents" href="/documents" />

      <DocumentDetailHero
        document={document}
        summary={summary}
        editable={!!currentUserId && document.userId === currentUserId}
      />

      {isFullyProcessing ? (
        <DocumentProcessingView documentId={documentId} />
      ) : (
        <>
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

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Card
              variant="aurora"
              tone="concept"
              hoverable={false}
              withAura={false}
            >
              <Card.Body
                sx={{
                  padding: { xs: "22px 24px 26px", md: "30px 34px 32px" },
                }}
              >
                <Card.Head sx={{ alignItems: "center", marginBottom: "22px" }}>
                  <Card.Icon>
                    <Brain size={22} />
                  </Card.Icon>
                  <Card.Title
                    sx={{
                      fontSize: "23px",
                      WebkitLineClamp: "unset",
                      display: "block",
                      overflow: "visible",
                    }}
                  >
                    Quizzes
                  </Card.Title>
                </Card.Head>

                {isEnriching && !quizzes?.length ? (
                  <Loader
                    variant="circular"
                    message={
                      document?.processingStage === "ENRICHING"
                        ? "Generating quiz questions..."
                        : "Preparing quiz..."
                    }
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
              </Card.Body>
            </Card>
          </MotionBox>
        </>
      )}
    </Box>
  );
}
