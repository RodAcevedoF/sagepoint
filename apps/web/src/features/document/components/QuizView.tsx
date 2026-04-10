"use client";

import { useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Send, ArrowLeft, Brain, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader, EmptyState, Button } from "@/shared/components";
import {
  ButtonVariants,
  ButtonSizes,
  ButtonIconPositions,
} from "@/shared/types";
import {
  useQuizQuestionsQuery,
  useSubmitQuizAttemptCommand,
} from "@/application/document";
import { QuestionCard } from "./QuestionCard";
import { QuizResults } from "./QuizResults";
import { makeStyles } from "./QuizView.styles";
import type { QuizAttemptDto } from "@/infrastructure/api/documentApi";

const MotionBox = motion.create(Box);

interface QuizViewProps {
  documentId: string;
  quizId: string;
}

export function QuizView({ documentId, quizId }: QuizViewProps) {
  const theme = useTheme();
  const router = useRouter();
  const styles = makeStyles(theme);
  const { data, isLoading } = useQuizQuestionsQuery(documentId, quizId);
  const { execute: submitAttempt, isLoading: submitting } =
    useSubmitQuizAttemptCommand();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptDto | null>(null);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    try {
      const attempt = await submitAttempt(documentId, quizId, answers);
      setResult(attempt);
    } catch {
      // Error handled by command hook
    }
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Back Button */}
      <Box>
        <Button
          label="Back to Document"
          icon={ArrowLeft}
          iconPos={ButtonIconPositions.START}
          variant={ButtonVariants.GHOST}
          onClick={() => router.push(`/documents/${documentId}`)}
        />
      </Box>

      {/* Hero Header */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        sx={styles.heroCard}
      >
        <Box sx={styles.accentBar} />
        <Box sx={styles.orb} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Brain size={24} color={theme.palette.info.light} />
          <Typography
            variant="overline"
            sx={{ color: theme.palette.info.light, fontWeight: 600 }}
          >
            Quiz
          </Typography>
        </Box>

        <Typography variant="h4" sx={styles.title}>
          {quiz.title}
        </Typography>

        {quiz.description && (
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary, mb: 1 }}
          >
            {quiz.description}
          </Typography>
        )}

        {!result && (
          <Box sx={styles.metaRow}>
            <Box sx={styles.metaItem}>
              <HelpCircle size={16} color={theme.palette.text.secondary} />
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                {answeredCount}/{totalCount} answered
              </Typography>
            </Box>
            <Box sx={{ ...styles.progressBarTrack }}>
              <Box sx={styles.progressBarFill(progressPercentage)} />
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
              sx={{ display: "flex", justifyContent: "flex-end", mb: 8 }}
            >
              <Button
                label={submitting ? "Submitting..." : "Submit Answers"}
                icon={Send}
                iconPos={ButtonIconPositions.START}
                size={ButtonSizes.LARGE}
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
