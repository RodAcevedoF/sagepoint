"use client";

import { Box } from "@mui/material";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Lightbulb,
  X,
} from "lucide-react";
import { ReviewSource } from "@sagepoint/domain";
import { Button, Card } from "@/shared/components";
import {
  ButtonVariants,
  ButtonSizes,
  ButtonIconPositions,
} from "@/shared/types";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { ReviewCallToAction } from "@/features/review";
import type {
  StepQuizQuestionDto,
  QuestionResultDto,
} from "@/infrastructure/api/roadmapApi";

interface QuizResultsProps {
  passed: boolean;
  score: number;
  results: QuestionResultDto[];
  questions: StepQuizQuestionDto[];
  conceptId: string;
  isGenerating: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function QuizResults({
  passed,
  score,
  results,
  questions,
  conceptId,
  isGenerating,
  onRetry,
  onClose,
}: QuizResultsProps) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const tone = passed ? auroraPalette.status.ready : auroraPalette.status.fail;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px", py: 1 }}>
      <Box
        sx={{
          textAlign: "center",
          padding: "26px 20px",
          borderRadius: auroraPalette.radii.card,
          background: auroraTint(tone, 0.1),
          border: `1px solid ${auroraTint(tone, 0.25)}`,
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-grid",
            placeItems: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: auroraTint(tone, 0.18),
            color: tone,
          }}
        >
          {passed ? <Trophy size={32} /> : <XCircle size={32} />}
        </Box>
        <Box
          component="h3"
          sx={{
            margin: "14px 0 0",
            fontFamily: auroraPalette.font.display,
            fontWeight: 800,
            fontSize: "20px",
            color: auroraPalette.txHi,
          }}
        >
          {passed ? "Quiz Passed!" : "Not Quite..."}
        </Box>
        <Box
          component="div"
          sx={{
            marginTop: "10px",
            fontFamily: auroraPalette.font.display,
            fontWeight: 900,
            fontSize: "40px",
            lineHeight: 1,
            color: tone,
          }}
        >
          {score}%
        </Box>
        <Box
          component="p"
          sx={{
            margin: "6px 0 0",
            fontSize: "13.5px",
            color: auroraPalette.txMid,
          }}
        >
          {correctCount}/{results.length} correct
        </Box>
        {passed && (
          <Box
            component="p"
            sx={{
              margin: "6px 0 0",
              fontSize: "13.5px",
              fontWeight: 500,
              color: auroraPalette.status.ready,
            }}
          >
            Step marked as completed
          </Box>
        )}
      </Box>

      {results.map((r) => {
        const question = questions[r.index];
        const cardTone = r.isCorrect ? "ready" : "fail";
        return (
          <Card
            key={r.index}
            variant="aurora"
            tone={cardTone}
            hoverable={false}
            withAura={false}
          >
            <Card.Body
              sx={{ padding: { xs: "18px 18px 20px", md: "22px 24px 22px" } }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: r.isCorrect
                      ? auroraPalette.status.ready
                      : auroraPalette.status.fail,
                    marginTop: "2px",
                  }}
                >
                  {r.isCorrect ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                </Box>
                <Box
                  component="p"
                  sx={{
                    margin: 0,
                    fontFamily: auroraPalette.font.display,
                    fontWeight: 700,
                    fontSize: "15.5px",
                    lineHeight: 1.4,
                    color: auroraPalette.txHi,
                  }}
                >
                  {r.index + 1}. {r.text}
                </Box>
              </Box>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {question?.options.map((opt) => {
                  const isCorrectOption = opt.label === r.correctAnswer;
                  const isUserSelection = opt.label === r.selectedAnswer;
                  const isWrongSelection = isUserSelection && !r.isCorrect;

                  let accent = auroraPalette.txMid;
                  let bg = "oklch(0.27 0.022 262 / 0.4)";
                  let border = auroraPalette.line;
                  if (isCorrectOption) {
                    accent = auroraPalette.status.ready;
                    bg = auroraTint(accent, 0.1);
                    border = auroraTint(accent, 0.4);
                  } else if (isWrongSelection) {
                    accent = auroraPalette.status.fail;
                    bg = auroraTint(accent, 0.1);
                    border = auroraTint(accent, 0.4);
                  }

                  return (
                    <Box
                      key={opt.label}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: auroraPalette.radii.md,
                        background: bg,
                        border: `1px solid ${border}`,
                        color: auroraPalette.tx,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          flexShrink: 0,
                          minWidth: 26,
                          height: 22,
                          px: "7px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: auroraPalette.radii.pill,
                          fontFamily: auroraPalette.font.mono,
                          fontSize: "10.5px",
                          fontWeight: 700,
                          background: auroraTint(accent, 0.2),
                          color: accent,
                        }}
                      >
                        {opt.label}
                      </Box>
                      <Box
                        component="span"
                        sx={{ flex: 1, fontSize: "13.5px" }}
                      >
                        {opt.text}
                      </Box>
                      {isCorrectOption && (
                        <CheckCircle2
                          size={16}
                          color={auroraPalette.status.ready}
                        />
                      )}
                      {isWrongSelection && (
                        <XCircle size={16} color={auroraPalette.status.fail} />
                      )}
                    </Box>
                  );
                })}
              </Box>

              {r.explanation && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginTop: "14px",
                    padding: "12px 14px",
                    borderRadius: auroraPalette.radii.md,
                    background: auroraTint(auroraPalette.status.proc, 0.08),
                    border: `1px solid ${auroraTint(auroraPalette.status.proc, 0.2)}`,
                    color: auroraPalette.txMid,
                    fontSize: "13px",
                    lineHeight: 1.55,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      flexShrink: 0,
                      color: auroraPalette.status.proc,
                      marginTop: "2px",
                    }}
                  >
                    <Lightbulb size={16} />
                  </Box>
                  {r.explanation}
                </Box>
              )}
            </Card.Body>
          </Card>
        );
      })}

      <ReviewCallToAction
        source={ReviewSource.ROADMAP_STEP}
        sourceId={conceptId}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        {!passed && (
          <Button
            label="Try Again"
            icon={RotateCcw}
            iconPos={ButtonIconPositions.START}
            variant={ButtonVariants.AURORA_OUTLINE}
            size={ButtonSizes.MEDIUM}
            onClick={onRetry}
            disabled={isGenerating}
            loading={isGenerating}
          />
        )}
        <Button
          label="Close"
          icon={X}
          iconPos={ButtonIconPositions.START}
          variant={ButtonVariants.AURORA}
          size={ButtonSizes.MEDIUM}
          onClick={onClose}
        />
      </Box>
    </Box>
  );
}
