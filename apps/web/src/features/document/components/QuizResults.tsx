"use client";

import { Box } from "@mui/material";
import { Trophy, RotateCcw } from "lucide-react";
import { ReviewSource } from "@sagepoint/domain";
import { Button, Card } from "@/shared/components";
import {
  ButtonIconPositions,
  ButtonSizes,
  ButtonVariants,
} from "@/shared/types";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { ReviewCallToAction } from "@/features/review";
import type { QuizAttemptDto } from "@/infrastructure/api/documentApi";

interface QuizResultsProps {
  attempt: QuizAttemptDto;
  onRetry?: () => void;
}

export function QuizResults({ attempt, onRetry }: QuizResultsProps) {
  const isPassing = attempt.score >= 70;
  const tone = isPassing ? "ready" : "proc";
  const accent = isPassing
    ? auroraPalette.status.ready
    : auroraPalette.status.proc;

  return (
    <Card variant="aurora" tone={tone} hoverable={false} withAura={false}>
      <Card.Body
        sx={{
          padding: { xs: "28px 24px 24px", md: "36px 36px 32px" },
          alignItems: "stretch",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: auroraTint(accent, 0.14),
              border: `1px solid ${auroraTint(accent, 0.32)}`,
              color: accent,
              margin: "0 auto 18px",
            }}
          >
            <Trophy size={40} />
          </Box>

          <Box
            component="p"
            sx={{
              fontFamily: auroraPalette.font.display,
              fontWeight: 800,
              fontSize: "clamp(40px, 6vw, 56px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: accent,
              margin: "0 0 6px",
            }}
          >
            {Math.round(attempt.score)}%
          </Box>
          <Box
            component="p"
            sx={{
              fontSize: "15px",
              color: auroraPalette.tx,
              margin: "0 0 4px",
            }}
          >
            {attempt.correctAnswers} of {attempt.totalQuestions} correct
          </Box>
          <Box
            component="p"
            sx={{
              fontFamily: auroraPalette.font.mono,
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: auroraPalette.txLow,
              margin: "0 0 22px",
            }}
          >
            {isPassing ? "Great job!" : "Keep practicing!"}
          </Box>

          {onRetry && (
            <Button
              label="Try Again"
              icon={RotateCcw}
              iconPos={ButtonIconPositions.START}
              size={ButtonSizes.MEDIUM}
              variant={ButtonVariants.AURORA}
              onClick={onRetry}
            />
          )}
        </Box>

        <Box sx={{ marginTop: "10px" }}>
          <ReviewCallToAction
            source={ReviewSource.DOCUMENT}
            sourceId={attempt.quizId}
          />
        </Box>
      </Card.Body>
    </Card>
  );
}
