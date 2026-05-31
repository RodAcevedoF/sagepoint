"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { Send, Brain, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BackLink, Button, EmptyState, Loader } from "@/shared/components";
import {
  ButtonIconPositions,
  ButtonSizes,
  ButtonVariants,
} from "@/shared/types";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import {
  useQuizQuestionsQuery,
  useSubmitQuizAttemptCommand,
} from "@/application/document";
import { QuestionCard } from "./QuestionCard";
import { QuizResults } from "./QuizResults";
import type { QuizAttemptDto } from "@/infrastructure/api/documentApi";

const MotionBox = motion.create(Box);

interface QuizViewProps {
  documentId: string;
  quizId: string;
}

export function QuizView({ documentId, quizId }: QuizViewProps) {
  const { data, isLoading } = useQuizQuestionsQuery(documentId, quizId);
  const { execute: submitAttempt, isLoading: submitting } =
    useSubmitQuizAttemptCommand();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptDto | null>(null);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    const attemptResult = await submitAttempt(documentId, quizId, answers);
    if (attemptResult.ok) setResult(attemptResult.data);
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
  };

  if (isLoading) {
    return <Loader variant="page" message="Loading quiz" />;
  }

  if (!data) {
    return <EmptyState title="Quiz not found" />;
  }

  const { quiz, questions } = data;
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const allAnswered = totalCount > 0 && answeredCount === totalCount;
  const progressPercentage =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

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
      <BackLink label="Back to Document" href={`/documents/${documentId}`} />

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          border: `1px solid ${auroraPalette.line}`,
          background:
            "linear-gradient(168deg, oklch(0.235 0.026 262 / 0.92), oklch(0.165 0.026 262 / 0.85))",
          boxShadow: auroraPalette.shadow.card,
          padding: { xs: "28px 22px 26px", md: "38px 40px 34px" },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "0 0 auto 0",
            height: "4px",
            background: `linear-gradient(90deg, ${auroraPalette.status.concept}, ${auroraPalette.teal} 70%, ${auroraPalette.status.enrich})`,
          },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: "-30%",
            right: "-6%",
            width: "46%",
            height: "90%",
            background: `radial-gradient(closest-side, ${auroraTint(auroraPalette.status.concept, 0.24)}, transparent)`,
            filter: "blur(26px)",
            opacity: 0.55,
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            width: "fit-content",
            alignItems: "center",
            gap: "9px",
            whiteSpace: "nowrap",
            marginBottom: "16px",
            fontFamily: auroraPalette.font.mono,
            fontSize: "11.5px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: auroraPalette.txLow,
          }}
        >
          <Box
            component="span"
            sx={{
              width: "30px",
              height: "30px",
              borderRadius: "9px",
              display: "grid",
              placeItems: "center",
              background: `color-mix(in oklch, ${auroraPalette.status.concept} 14%, ${auroraPalette.surface2})`,
              border: `1px solid ${auroraTint(auroraPalette.status.concept, 0.24)}`,
              color: auroraPalette.status.concept,
            }}
          >
            <Brain size={16} />
          </Box>
          Quiz · {totalCount} question{totalCount !== 1 ? "s" : ""}
        </Box>

        <Box
          component="h1"
          sx={{
            position: "relative",
            zIndex: 1,
            margin: 0,
            fontFamily: auroraPalette.font.display,
            fontWeight: 800,
            fontSize: "clamp(28px, 3.4vw, 44px)",
            lineHeight: 1.04,
            letterSpacing: "-0.025em",
            background: `linear-gradient(120deg, ${auroraPalette.txHi} 30%, ${auroraPalette.status.concept} 95%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {quiz.title}
        </Box>

        {quiz.description && (
          <Box
            component="p"
            sx={{
              position: "relative",
              zIndex: 1,
              margin: "16px 0 0",
              maxWidth: "62ch",
              fontSize: "15px",
              lineHeight: 1.6,
              color: auroraPalette.txMid,
            }}
          >
            {quiz.description}
          </Box>
        )}

        {!result && (
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
              marginTop: "22px",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: auroraPalette.font.mono,
                fontSize: "13px",
                color: auroraPalette.txLow,
              }}
            >
              <HelpCircle size={14} />
              {answeredCount}/{totalCount} answered
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 160,
                height: 6,
                borderRadius: 3,
                background: auroraTint(auroraPalette.status.concept, 0.12),
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${auroraPalette.status.concept}, ${auroraPalette.teal})`,
                  width: `${progressPercentage}%`,
                  transition: "width 0.4s ease",
                }}
              />
            </Box>
          </Box>
        )}
      </MotionBox>

      {result ? (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <QuizResults attempt={result} onRetry={handleRetry} />
        </MotionBox>
      ) : (
        <>
          {questions.map((question, index) => (
            <MotionBox
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
            >
              <QuestionCard
                question={question}
                selectedAnswer={answers[question.id]}
                onAnswer={handleAnswer}
              />
            </MotionBox>
          ))}

          {totalCount > 0 && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + totalCount * 0.08 }}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                label={submitting ? "Submitting..." : "Submit Answers"}
                icon={Send}
                iconPos={ButtonIconPositions.START}
                size={ButtonSizes.LARGE}
                variant={ButtonVariants.AURORA}
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
              />
            </MotionBox>
          )}
        </>
      )}
    </Box>
  );
}
